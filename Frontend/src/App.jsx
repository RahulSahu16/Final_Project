import { BrowserRouter, Routes, Route } from "react-router-dom";
import Homepage from "./pages/HomePage";
import Navbar from "./components/NavBar/Navbar";
import AllHomesPage from "./pages/AllHomes";
import HomeDetails from "./pages/HomeDetails";
import AuthPage from "./pages/AuthPage";
import HostForm from "./components/Host Form/HostFrom";
import FavouritesPage from "./pages/Favourites";

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
        <Route path="/host/add-home" element={<HostForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;