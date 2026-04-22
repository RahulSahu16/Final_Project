import { useEffect, useState } from "react";
import HomeCard from "./HomepageCard";
import { getProperties } from "../../services/propertyService";

function FeaturedHomes() {
  const [homes, setHomes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedHomes = async () => {
      try {
        const properties = await getProperties();

        const featured = properties
          .map((home) => {
            const rating = Number(home.rating) || 0;
            const amenitiesScore = Math.min((home.amenities || []).length, 5) * 0.08;
            const roomsScore = Math.min(Number(home.totalRooms) || 0, 5) * 0.03;
            const fallbackRating = Number((4.2 + amenitiesScore + roomsScore).toFixed(1));

            return {
              ...home,
              displayRating: rating || fallbackRating,
              featuredScore: rating || fallbackRating,
            };
          })
          .sort((a, b) => b.featuredScore - a.featuredScore)
          .slice(0, 6);

        setHomes(featured);
      } catch (error) {
        console.error("Failed to load featured homes:", error);
        setHomes([]);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedHomes();
  }, []);

  return (
    <div className="px-10 mt-20">
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">Featured Homes</h2>
          <p className="text-sm text-gray-700 mt-1">
            Top picks from live listings you can open right now
          </p>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-700">Loading featured homes...</p>
      ) : homes.length === 0 ? (
        <p className="text-gray-700">No featured homes available yet.</p>
      ) : (
        <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
          {homes.map((home) => (
            <div key={home._id} className="min-w-[280px] max-w-[280px]">
              <HomeCard home={home} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FeaturedHomes;
