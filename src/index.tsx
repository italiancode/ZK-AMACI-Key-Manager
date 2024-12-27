import "./index.css";
// import "./styles/crypto-theme.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { isExtension } from "./utils/environment";
import Dashboard from "./components/Dashboard";
import AuthPage from "./pages/auth";


const AppIndex: React.FC = () => {
  // For extension, just return Dashboard
  if (isExtension()) {
    return <Dashboard />;
  }

  // For web app, use routing
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/auth" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppIndex;
