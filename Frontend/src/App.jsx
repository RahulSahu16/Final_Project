import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/HomePage";
import Navbar from "./components/NavBar/Navbar";
import AllHomesPage from "./pages/AllHomes";
import HomeDetails from "./pages/HomeDetails";
import AuthPage from "./pages/AuthPage";
import AddStay from "./pages/AddStay";
import FavouritesPage from "./pages/Favourites";
import SearchCity from "./pages/SearchCity";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/AllHomes" element={<AllHomesPage />} />
        <Route path="/Favourites" element={<FavouritesPage />} />
        <Route path="/homes/:homeId" element={<HomeDetails />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/addstay" element={<AddStay />} />
        <Route
          path="/addstay"
          element={
            <ProtectedRoute roles={["host"]}>
              <AddStay />
            </ProtectedRoute>
          }
        />
        <Route path="/search" element={<SearchCity />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;