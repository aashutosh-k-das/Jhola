import { createSlice } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'ui',
  initialState: { drawerOpen: false },
  reducers: {
    openDrawer: (s) => { s.drawerOpen = true; },
    closeDrawer: (s) => { s.drawerOpen = false; },
  },
});

export const { openDrawer, closeDrawer } = slice.actions;
export default slice.reducer;
