import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

const rootContainer = document.getElementById("root") as HTMLElement;
ReactDOM.createRoot(rootContainer).render(
  <React.StrictMode>
    <Theme>
      <App />
    </Theme>
  </React.StrictMode>
);
