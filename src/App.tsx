import "./index.css";
// import "./styles/crypto-theme.css";

import { AuthProvider } from "./contexts/AuthContext";
import AppIndex from ".";
import { isExtension } from "./utils/environment";

const App: React.FC = () => {
  // For web app, use routing
  return (
    <div
      className={`app-container mx-auto ${
        isExtension() ? "h-[600px] w-[400px]" : "w-full min-h-screen"
      }`}
    >
      <AuthProvider>
        <main className="h-full">
          <AppIndex />
        </main>
      </AuthProvider>
    </div>
  );
};

export default App;
