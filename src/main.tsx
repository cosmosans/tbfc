import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><BrowserRouter><ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider></BrowserRouter></React.StrictMode>,
);
