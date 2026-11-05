import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#f47730' },
    secondary: { main: '#8fc7a2' },
    background: { default: '#0d1012', paper: '#171a1c' },
  },
  shape: { borderRadius: 0 },
  typography: { fontFamily: 'Oxanium, ui-sans-serif, system-ui, sans-serif', h4: { fontWeight: 800 }, h5: { fontWeight: 750 }, h6: { fontWeight: 700 } },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 0 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiCard: { styleOverrides: { root: { border: '1px solid #CA512644' } } },
    MuiAlert: { styleOverrides: { root: { backgroundColor: '#111', color: '#fff' } } },
    MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: '#111', '& fieldset': { borderColor: '#CA512655' } } } },
  },
});
