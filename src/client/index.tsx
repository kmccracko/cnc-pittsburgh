import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './components/App';

console.log('hello');
// import { responsiveFontSizes, ThemeProvider } from '@mui/material';
// import theme from './theme';

// theme = responsiveFontSizes(theme);

const root = createRoot(document.getElementById('root')!);

root.render(
  // <ThemeProvider theme={theme}>
  // <React.StrictMode>
  <HashRouter>
    <App />
  </HashRouter>
  // </React.StrictMode>
  // </ThemeProvider>
);
