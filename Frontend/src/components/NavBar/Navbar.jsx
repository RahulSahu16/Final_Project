import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useAuth } from "../../hooks/useAuth";
import { becomeHost } from "../../services/authService";

function Navbar() {
  const { user, isAuthenticated, logout, login } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleAddStay = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // ✅ If already host → go directly
    if (user?.roles?.includes("host")) {
      navigate("/addstay");
      return;
    }

    // ✅ Upgrade to host
    try {
      const response = await becomeHost();

      if (response?.user) {
        const token = localStorage.getItem("authToken");
        login({ user: response.user, token });
      }

      navigate("/addstay"); // ✅ FIXED
    } catch {
      alert("Unable to enable host access. Please login again.");
    }
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

      {/* Links */}
      <div className="flex items-center gap-6 text-black font-medium">
        
        <Link to="/" className="hover:text-gray-700 transition">
          Home
        </Link>

        <Link to="/AllHomes" className="hover:text-gray-700 transition">
          All Homes
        </Link>

        <Link to="/Favourites" className="hover:text-gray-700 transition">
          Favourites
        </Link>

        <button
          type="button"
          onClick={handleAddStay}
          className="hover:text-gray-700 transition"
        >
          Add Stay
        </button>

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