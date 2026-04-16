import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../../assets/logo.png";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const onAuthChanged = () => {
      const updatedUser = localStorage.getItem("authUser");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener("authChanged", onAuthChanged);
    return () => window.removeEventListener("authChanged", onAuthChanged);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="bg-[#b5ae9d] px-10 py-4 flex items-center justify-between shadow-md">
      
      {/* Logo */}
      <Link className="h-10 flex items-center" to="/">
        <img
          src={logo}
          alt="CozyStay"
          className="h-10 object-contain transition-transform duration-200 hover:scale-105"
        />
      </Link>

      {/* Search */}
      <div className="w-1/3">
        <input
          type="text"
          placeholder="Search stays..."
          className="w-full px-4 py-2 rounded-md border border-gray-400 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-600"
        />
      </div>

      {/* Links */}
      <div className="flex items-center gap-6 text-black font-medium">
        
        <Link 
          to="/" 
          className="hover:text-gray-700 transition"
        >
          Home
        </Link>

        <Link 
          to="/AllHomes" 
          className="hover:text-gray-700 transition"
        >
          All Homes
        </Link>

        <Link 
          to="/Favourites" 
          className="hover:text-gray-700 transition"
        >
          Favourites
        </Link>

        <Link 
          to="/host/add-home" 
          className="hover:text-gray-700 transition"
        >
          Add Stay
        </Link>

        {user ? (
          <div className="flex items-center gap-3">
            <span className="font-semibold">{user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login">
            <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition">
              Login
            </button>
          </Link>
        )}

      </div>
    </nav>
  );
}

export default Navbar;