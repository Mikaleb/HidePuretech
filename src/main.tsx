import React from "react";
import ReactDOM from "react-dom/client";
import CssBaseline from "@mui/material/CssBaseline";
import "./index.css";
import App from "./App.tsx";

const rootContainer = document.getElementById("root") as HTMLElement;
ReactDOM.createRoot(rootContainer).render(
  <React.StrictMode>
    <CssBaseline />
    <App />
  </React.StrictMode>
);
