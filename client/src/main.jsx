import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './redux/store';
import App from './App';
import { LanguageProvider } from './i18n';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <LanguageProvider>
          <App />
        </LanguageProvider>
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 2500,
            style: { background: '#212121', color: '#fff', borderRadius: '4px', fontSize: '14px', marginBottom: '56px' },
            success: { iconTheme: { primary: '#ffe500', secondary: '#212121' } },
          }}
        />
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
