import { useEffect, useState } from "react";
import HomeCard from "../Homepage/HomepageCard";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaHeart } from "react-icons/fa";
import { deleteProperty, getProperties } from "../../services/propertyService";
import { useAuth } from "../../hooks/useAuth";
import { useFavourites } from "../../hooks/useFavourites";

function AllHomes() {
  const [homes, setHomes] = useState([]);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const { favourites, toggleFavourite } = useFavourites();
  const navigate = useNavigate();

  useEffect(() => {
    getProperties()
      .then(setHomes)
      .catch(() => {
        setHomes([]);
        setError("Failed to fetch homes");
      });
  }, []);

  const handleDelete = async (homeId) => {
    if (!window.confirm("Delete this property?")) return;

    try {
      await deleteProperty(homeId);
      setHomes((prev) => prev.filter((h) => h._id !== homeId));
    } catch (_err) {
      setError("Delete failed");
    }
  };

  const handleEdit = (home) => {
    navigate("/addstay", { state: { property: home } });
  };

  return (
    <div className="bg-[#b5ae9d]">
      <h1 className="text-2xl font-semibold mb-6 bg-black text-white p-4 text-center mt-4">
        All Homes
      </h1>
      {error ? <p className="text-center text-red-700">{error}</p> : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
        {homes.map((home) => {
          const isOwner = user && home.owner?.email === user.email;
          const isFavourite = favourites.includes(String(home._id));

          return (
            <div key={home._id} className="relative">
              <HomeCard home={home} type="full" />

              <div className="flex justify-center gap-3 mt-2">
                {isOwner && (
                  <button
                    onClick={() => handleEdit(home)}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                  >
                    <FaEdit />
                  </button>
                )}

                {user && (
                  <button
                    onClick={() => toggleFavourite(home._id)}
                    className={`p-2 rounded-full transition ${
                      isFavourite
                        ? "bg-red-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    <FaHeart />
                  </button>
                )}

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
