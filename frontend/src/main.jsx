import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app/App.jsx";
import "./index.css";
import { Providers } from "./app/providers/index.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Providers>
    <App />
  </Providers>
);