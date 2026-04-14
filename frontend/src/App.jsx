import { Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import AdminPage from "./pages/AdminPage.jsx"
import HomePage from "./pages/HomePage.jsx"
import PlannerPage from "./pages/PlannerPage.jsx"

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  )
}

export default App
