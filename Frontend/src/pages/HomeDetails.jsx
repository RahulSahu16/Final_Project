import Amenities from "../components/homeDetails/Amenities";
import Reviews from "../components/homeDetails/Reviews";
import SimilarHomes from "../components/homeDetails/SimilarHomes";
import HostInfo from "../components/homeDetails/HostInfo";
import ImageGallery from "../components/homeDetails/ImageGallery";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function HomeDetails() {
  const { homeId } = useParams();

  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:5000/api/properties/${homeId}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch home");
        }

        const data = await res.json();

        setHome(data);
      } catch (err) {
        console.error("Fetch error:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, [homeId]);

  // ================= UI STATES =================

  if (loading)
    return (
      <div className="text-center mt-20 text-lg font-semibold">
        Loading home details...
      </div>
    );

  if (error)
    return (
      <div className="text-center mt-20 text-red-500 font-semibold">
        {error}
      </div>
    );

  if (!home)
    return (
      <div className="text-center mt-20 text-gray-500">
        No home data found
      </div>
    );

  // ================= SAFE DATA =================

  const getImageArray = () => {
  if (home.images && home.images.length > 0) {
    return home.images.map(
      (img) => `http://localhost:5000/uploads/${img}`
    );
  }

  return ["https://via.placeholder.com/800x400?text=No+Image"];
};

const images = getImageArray();

  // ================= MAIN UI =================

  return (
  <div className="max-w-6xl mx-auto px-6 py-8">

    {/* IMAGE */}
    <ImageGallery
      images={images}
    />

    {/* HEADER */}
    <div className="mb-8 border-b pb-6">
      <h1 className="text-3xl font-bold">{home.title}</h1>
      <p className="text-gray-500 mt-1">{home.address}</p>

      {/* BASIC INFO */}
      <div className="flex gap-4 text-sm text-gray-600 mt-3">
        <span>{home.guests || 4} guests</span>
        <span>{home.bedrooms || 2} bedrooms</span>
        <span>{home.beds || 2} beds</span>
        <span>{home.bathrooms || 1} bath</span>
      </div>
    </div>

    {/* MAIN GRID */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

      {/* LEFT */}
      <div className="md:col-span-2 space-y-10">

        {/* DESCRIPTION */}
        <section>
          <h2 className="text-xl font-semibold mb-2">About this place</h2>
          <p className="text-gray-700 leading-relaxed">
            {home.description}
          </p>
        </section>

        {/* HOST INFO */}
        <section className="border-t pt-6">
          <HostInfo host={home.owner} />
        </section>

        {/* AMENITIES */}
        <section className="border-t pt-6">
          <Amenities
            amenities={
              home.amenities || ["WiFi", "AC", "Kitchen", "Parking"]
            }
          />
        </section>

        {/* REVIEWS */}
        <section className="border-t pt-6">
          <Reviews
            reviews={
              home.reviews || [
                { user: "Rahul", comment: "Great stay!" },
                { user: "Amit", comment: "Very clean and comfortable." }
              ]
            }
          />
        </section>

      </div>

      {/* RIGHT (BOOKING CARD) */}
      <div className="sticky top-24 h-fit border rounded-2xl shadow-lg p-6">

        <h2 className="text-2xl font-bold">
          ₹{home.price}
          <span className="text-sm font-normal"> / night</span>
        </h2>

        <p className="text-red-500 text-sm mt-1">
          Only {home.roomsLeft || 3} rooms left
        </p>

        {/* DATE INPUTS */}
        <div className="mt-4 space-y-3">
          <input
            type="date"
            className="w-full border rounded-lg p-2"
          />
          <input
            type="date"
            className="w-full border rounded-lg p-2"
          />
        </div>

        <button className="bg-black hover:bg-gray-800 transition text-white w-full py-3 mt-5 rounded-xl font-semibold">
          Reserve
        </button>

        <p className="text-xs text-gray-400 text-center mt-2">
          You won’t be charged yet
        </p>
      </div>

    </div>

    {/* SIMILAR HOMES */}
    <div className="mt-14 border-t pt-8">
      <SimilarHomes homes={home.similarHomes || []} />
    </div>

  </div>
);
}

export default HomeDetails;