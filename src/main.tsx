import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ThemeProvider, createTheme, ThemeOptions } from "@mui/material/styles";

import "./index.css";
import App from "./App.tsx";

import NeogreyMedium from "./fonts/Neogrey/NeogreyMedium.woff";
import NeogreyRegular from "./fonts/Neogrey/NeogreyRegular.woff";

const rootContainer = document.getElementById("root") as HTMLElement;

const getDesignTokens = (mode: "light" | "dark"): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: "#f24535", // Brand red from puretech context
    },
    background: {
      default: mode === "dark" ? "#0d0d0d" : "#f0f2f5",
      paper: mode === "dark" ? "#1b2021" : "#ffffff",
    },
  },
  typography: {
    h4: { fontFamily: '"Neogrey", sans-serif' },
    h5: { fontFamily: '"Neogrey", sans-serif' },
    subtitle2: { fontWeight: 600, opacity: 0.8 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Neogrey';
          font-style: normal;
          font-weight: normal;
          src: local('Neogrey'), url(${NeogreyRegular}) format('woff');
        }
        @font-face {
          font-family: 'Neogrey Medium';
          font-style: normal;
          font-weight: normal;
          src: local('Neogrey Medium'), url(${NeogreyMedium}) format('woff');
        }
        body {
          margin: 0;
          box-sizing: border-box;
          width: 360px;
          min-height: 480px;
          overflow-x: hidden;
          overflow-y: overlay; // nice scrollbar
        }
      `,
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 42,
          height: 26,
          padding: 0,
          margin: 8,
        },
        switchBase: {
          padding: 1,
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: '#f24535',
              opacity: 1,
              border: 0,
            },
          },
        },
        thumb: {
          width: 24,
          height: 24,
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.2)',
        },
        track: {
          borderRadius: 13,
          backgroundColor: mode === 'dark' ? '#39393D' : '#E9E9EA',
          opacity: 1,
          transition: 'background-color 300ms',
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          padding: 0,
        }
      }
    }
  },
});

function ThemeApp() {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () => createTheme(getDesignTokens(prefersDarkMode ? "dark" : "light")),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(rootContainer).render(
  <React.StrictMode>
    <ThemeApp />
  </React.StrictMode>
);
