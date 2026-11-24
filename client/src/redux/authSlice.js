import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api, { AUTH_KEY } from '../utils/api';
import { loadJSON, saveJSON } from '../utils/storage';

const stored = loadJSON(AUTH_KEY);

export const login = createAsyncThunk('auth/login', async (body) => (await api.post('/users/login', body)).data);
export const register = createAsyncThunk('auth/register', async (body) => (await api.post('/users/register', body)).data);
export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (body) => (await api.post('/users/otp/verify', body)).data);
export const fetchMe = createAsyncThunk('auth/me', async () => (await api.get('/users/me')).data);
export const updateProfile = createAsyncThunk('auth/update', async (body) => (await api.put('/users/me', body)).data);

const persist = (state) => saveJSON(AUTH_KEY, state.token ? { token: state.token, user: state.user } : null);

const slice = createSlice({
  name: 'auth',
  initialState: { token: stored?.token || null, user: stored?.user || null },
  reducers: {
    logout(state) {
      state.token = null;
      state.user = null;
      persist(state);
    },
    setAddresses(state, { payload }) {
      if (state.user) state.user.addresses = payload;
      persist(state);
    },
  },
  extraReducers: (b) => {
    b.addMatcher(
      (a) => [login.fulfilled.type, register.fulfilled.type, verifyOtp.fulfilled.type].includes(a.type),
      (state, { payload }) => {
        state.token = payload.token;
        state.user = payload.user;
        persist(state);
      }
    );
    b.addMatcher(
      (a) => [fetchMe.fulfilled.type, updateProfile.fulfilled.type].includes(a.type),
      (state, { payload }) => {
        // After a password change the server revokes old tokens and sends a fresh one.
        const { token, ...user } = payload;
        if (token) state.token = token;
        state.user = user;
        persist(state);
      }
    );
  },
});

export const { logout, setAddresses } = slice.actions;
export default slice.reducer;
