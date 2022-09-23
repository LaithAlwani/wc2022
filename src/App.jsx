import "./App.css";
import Layout from "./components/layout/Layout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Games from "./pages/Games";
import { UserContext } from "./lib/context";
import { useUserData } from "./lib/hooks";

function App() {
  const userData = useUserData()
  return (
    <UserContext.Provider value={userData}>
      <Router>
        <div className="App">
          <Layout>
            <Toaster />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<Games />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
