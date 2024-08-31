import React from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";
import App from "./App.tsx";

import NeogreyMedium from "./fonts/Neogrey/NeogreyMedium.woff";
import NeogreyRegular from "./fonts/Neogrey/NeogreyRegular.woff";

import { ThemeProvider, createTheme } from "@mui/material/styles";

const rootContainer = document.getElementById("root") as HTMLElement;

const theme = createTheme({
  typography: {},
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
      `,
    },
    MuiTypography: {
      styleOverrides: {
        h4: {
          fontFamily: '"Neogrey", sans-serif',
        },
      },
    },
  },
  palette: {
    primary: {
      main: "#f24535ff",
      light: "#ff7a6aff",
      dark: "#ba000dff",
    },
  },
});

ReactDOM.createRoot(rootContainer).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
