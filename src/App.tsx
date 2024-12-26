import "./index.css";
// import "./styles/crypto-theme.css";

import Dashboard from "./components/Dashboard";

function App() {
  return (
    <div className="app-container mx-auto bg-gray-100 w-[400px] h-[600px]">
      <main className="">
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
