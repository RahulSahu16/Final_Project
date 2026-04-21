import { StrictMode } from 'react'
import ReactDOM from "react-dom/client";
import './index.css'
import "leaflet/dist/leaflet.css";
import App from './App.jsx'
import { AuthProvider } from "./context/AuthContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
