import { useEffect, useState } from "react";
import HomeCard from "../components/Homepage/HomepageCard";

function FavouritesPage() {
  const [homes, setHomes] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
      .catch((err) => setError(err.message || "Failed to load favourites"))
      .finally(() => setLoading(false));
  }, []);

  const favouriteHomes = homes.filter((home) =>
    favourites.includes(home._id)
  );

  if (loading) {
    return (
      <div className="text-center mt-20 text-lg font-semibold">
        Loading favourite homes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20 text-red-500 font-semibold">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Favourite Homes</h1>

        {favouriteHomes.length === 0 ? (
          <div className="text-center text-gray-600">
            You have no favourite homes yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favouriteHomes.map((home) => (
              <HomeCard key={home._id} home={home} type="full" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FavouritesPage;
