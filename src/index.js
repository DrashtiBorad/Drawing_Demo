import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "hplx-react-elements-dev/dist/esm/index.css";

import WebFont from "webfontloader";

const root = ReactDOM.createRoot(document.getElementById("root"));

WebFont.load({
  google: {
    families: ["Inter:400,500,600,700&display=swap"],
  },
});

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
