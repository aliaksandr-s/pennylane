import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ApiProvider } from "../api";
import { ToastProvider } from "./providers/Toast";

const {
  REACT_APP_API_BASE_URL,
  REACT_APP_API_TOKEN,
} = process.env;

ReactDOM.render(
  <React.StrictMode>
    <ApiProvider 
      url={REACT_APP_API_BASE_URL} 
      token={REACT_APP_API_TOKEN}
    >
      <ToastProvider>
        <App />
      </ToastProvider>
    </ApiProvider>
  </React.StrictMode>, document.getElementById("root")
);
// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

