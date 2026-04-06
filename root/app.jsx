import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

function Home() {
  return <h1>Home</h1>;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;
