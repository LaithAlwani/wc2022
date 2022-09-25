import "./App.css";
import Layout from "./components/layout/Layout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Home from "./pages/Home";
import Games from "./pages/Matches";
import { UserContext } from "./lib/context";
import { useUserData } from "./lib/hooks";
import Groups from "./pages/Groups";

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
              <Route path="matches" element={<Games />} />
              <Route path="groups" element={<Groups />} />
            </Routes>
          </Layout>
        </div>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
