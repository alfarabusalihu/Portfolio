'use client';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#4169E1', // Royal Blue
        },
        secondary: {
            main: '#C0C0C0', // Silver
        },
        background: {
            default: '#000814', // Deep Navy
            paper: '#001f3f',   // Dark Azure
        },
        text: {
            primary: '#FFFFFF',
            secondary: '#C0C0C0', // Silver
        },
    },
    typography: {
        fontFamily: 'var(--font-outfit), sans-serif',
        h1: { fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 900 },
        h2: { fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 800 },
        h3: { fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700 },
        h4: { fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 700 },
        h5: { fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 600 },
        h6: { fontFamily: 'var(--font-space-grotesk), sans-serif', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    textTransform: 'none',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                }
            }
        }
    },
});

export default theme;
