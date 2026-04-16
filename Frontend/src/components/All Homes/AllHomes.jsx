import { useEffect, useState } from "react";
import HomeCard from "../Homepage/HomepageCard";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaHeart } from "react-icons/fa";

function AllHomes() {
  const [homes, setHomes] = useState([]);
  const [user, setUser] = useState(null);
  const [favourites, setFavourites] = useState([]); // ✅ FIXED (moved inside)

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedFavourites = localStorage.getItem("favourites");
    if (storedFavourites) {
      setFavourites(JSON.parse(storedFavourites));
    }

    fetch("http://localhost:5000/api/properties")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch homes");
        return res.json();
      })
      .then((data) => setHomes(data))
      .catch((err) => {
        console.log(err);
        setHomes([]);
      });
  }, []);

  // DELETE
  const handleDelete = async (homeId) => {
    if (!window.confirm("Delete this property?")) return;

    const token = localStorage.getItem("authToken");

    try {
      const res = await fetch(
        `http://localhost:5000/api/properties/${homeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setHomes((prev) => prev.filter((h) => h._id !== homeId));
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // EDIT
  const handleEdit = (home) => {
    navigate("/host/add-home", { state: { property: home } });
  };

  // FAVOURITE TOGGLE
  const handleFavourite = (homeId) => {
    setFavourites((prev) => {
      const next = prev.includes(homeId)
        ? prev.filter((id) => id !== homeId)
        : [...prev, homeId];
      localStorage.setItem("favourites", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6 bg-black text-white p-4 text-center mt-4">
        All Homes
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {homes.map((home) => {
          const isOwner =
            user && home.owner?.email === user.email;

          return (
            <div key={home._id} className="relative">
              <HomeCard home={home} type="full" />

              <div className="flex justify-center gap-3 mt-2">
                
                {/* EDIT */}
                {isOwner && (
                  <button
                    onClick={() => handleEdit(home)}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                  >
                    <FaEdit />
                  </button>
                )}

                {/* FAVOURITE */}
                {user && (
                  <button
                    onClick={() => handleFavourite(home._id)}
                    className={`p-2 rounded-full transition ${
                      favourites.includes(home._id)
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <FaHeart />
                  </button>
                )}

                {/* DELETE */}
                {isOwner && (
                  <button
                    onClick={() => handleDelete(home._id)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AllHomes;