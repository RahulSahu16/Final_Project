import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEdit, FaHeart } from "react-icons/fa";
import { searchProperties } from "../../services/propertyService";
import { useAuth } from "../../hooks/useAuth";
import { useFavourites } from "../../hooks/useFavourites";

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const city = queryParams.get("city") || "";
  const checkIn = queryParams.get("checkIn") || "";
  const checkOut = queryParams.get("checkOut") || "";

  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { favourites, toggleFavourite } = useFavourites();

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await searchProperties({ city, checkIn, checkOut });
        setHomes(data);
      } catch (err) {
        console.error("Error fetching search results:", err);
        setHomes([]);
      } finally {
        setLoading(false);
      }
    };

    if (city || (checkIn && checkOut)) {
      fetchResults();
    } else {
      setHomes([]);
      setLoading(false);
    }
  }, [city, checkIn, checkOut]);

  const handleEdit = (home) => {
    navigate("/addstay", { state: { property: home } });
  };

  const getImageUrl = (home) => {
    if (home.images && home.images.length > 0) {
      return home.images[0].startsWith("http")
        ? home.images[0]
        : `${import.meta.env.VITE_UPLOADS_URL || "http://localhost:5000/uploads"}/${home.images[0]}`;
    }
    return (
      home.imageURL ||
      home.image ||
      "https://via.placeholder.com/640x480?text=House"
    );
  };

  if (loading) {
    return (
      <h2 className="text-center mt-10 text-lg font-semibold">
        Loading search results...
      </h2>
    );
  }

  if (homes.length === 0) {
    return (
      <h2 className="text-center mt-10 text-lg font-semibold">
        No properties found
      </h2>
    );
  }

  return (
    <div className="p-6 bg-[#ece7d9] min-h-screen">
      <h1 className="text-3xl font-bold mb-10 text-center">
        Search results for{" "}
        <span className="text-blue-600 capitalize">{city}</span>
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {homes.map((home) => {
          const isOwner = user && home.owner && home.owner.email === user.email;
          const isFavourite = favourites.includes(String(home._id));
          const imageUrl = getImageUrl(home);

          return (
            <div
              key={home._id}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1 transition duration-300 group"
            >
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={home.title}
                  className="h-56 w-full object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/640x480?text=House";
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                <div className="absolute bottom-3 left-3 text-white font-semibold text-sm">
                  Rs {home.price} / night
                </div>

                {user && (
                  <button
                    onClick={() => toggleFavourite(home._id)}
                    className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow hover:scale-110 transition"
                  >
                    <FaHeart
                      className={`text-lg ${
                        isFavourite ? "text-red-500" : "text-gray-600"
                      }`}
                    />
                  </button>
                )}
              </div>

              <div className="p-4">
                <h2 className="text-lg font-semibold line-clamp-1">
                  {home.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {home.city || home.address || home.location}
                </p>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    onClick={() => navigate(`/homes/${home._id}`)}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
                  >
                    View Details
                  </button>

                  {isOwner && (
                    <button
                      onClick={() => handleEdit(home)}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition flex items-center gap-1"
                    >
                      <FaEdit size={12} />
                      Edit
                    </button>
                  )}
                </div>

                {home.owner?.email && (
                  <p className="text-xs text-gray-400 mt-3">
                    Hosted by {home.owner.email}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SearchResults;
