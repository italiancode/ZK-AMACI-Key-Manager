import "./index.css";
// import "./styles/crypto-theme.css";

import { AuthProvider } from "./contexts/AuthContext";
import AppIndex from ".";

const App: React.FC = () => {
  // For web app, use routing
  return (
    <div className="app-container mx-auto w-[400px] h-[600px]">
      <AuthProvider>
        <main className="h-full">
          <AppIndex />
        </main>
      </AuthProvider>
    </div>
  );
};

export default App;
