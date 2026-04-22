import Amenities from "../components/homeDetails/Amenities";
import Reviews from "../components/homeDetails/Reviews";
import SimilarHomes from "../components/homeDetails/SimilarHomes";
import HostInfo from "../components/homeDetails/HostInfo";
import ImageGallery from "../components/homeDetails/ImageGallery";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProperties, getPropertyById } from "../services/propertyService";
import {
  createBooking,
  createPaymentOrder,
  verifyPayment,
} from "../services/bookingService";
import PropertyMapView from "../components/PropertyMapView";

function HomeDetails() {
  const { homeId } = useParams();

  const [home, setHome] = useState(null);
  const [similarHomes, setSimilarHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedRooms, setSelectedRooms] = useState(1);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  useEffect(() => {
    const fetchHome = async () => {
      try {
        setLoading(true);
        const [data, properties] = await Promise.all([
          getPropertyById(homeId),
          getProperties(),
        ]);

        setHome(data);

        const currentPrice = Number(data.price) || 0;
        const currentAddress = (data.address || "").toLowerCase();

        const relatedHomes = properties
          .filter((item) => String(item._id) !== String(data._id))
          .map((item) => {
            const itemPrice = Number(item.price) || 0;
            const itemAddress = (item.address || "").toLowerCase();
            const sharedAddressToken =
              currentAddress &&
              itemAddress &&
              currentAddress
                .split(/[,\s]+/)
                .filter((part) => part.length > 2)
                .some((part) => itemAddress.includes(part));

            const priceGap = Math.abs(itemPrice - currentPrice);
            const priceScore =
              priceGap <= 1000 ? 2 : priceGap <= 2500 ? 1 : 0;

            return {
              ...item,
              similarityScore: (sharedAddressToken ? 2 : 0) + priceScore,
            };
          })
          .sort((a, b) => b.similarityScore - a.similarityScore)
          .slice(0, 3);

        setSimilarHomes(relatedHomes);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHome();
  }, [homeId]);

  const handleReserve = async () => {
    try {
      if (!checkIn || !checkOut) return alert("Select check-in & check-out");

      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkInDate >= checkOutDate) return alert("Invalid date range");

      if (!localStorage.getItem("authToken")) return alert("Login first");

      const booking = await createBooking({
        propertyId: home._id,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        roomsBooked: Number(selectedRooms),
      });

      const paymentOrder = await createPaymentOrder({
        bookingId: booking._id,
      });

      const options = {
        key: paymentOrder.key,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: "CozyStay",
        description: home.title,
        order_id: paymentOrder.orderId,
        handler: async function (response) {
          await verifyPayment({
            bookingId: booking._id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          alert("Booking confirmed");
          window.location.href = "/";
        },
        theme: { color: "#6366F1" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  if (error) {
    return <div className="text-center mt-20 text-red-500">{error}</div>;
  }

  if (!home) return null;

  const images =
    home.images?.length > 0
      ? home.images.map((img) =>
          img.startsWith("http")
            ? img
            : `http://localhost:5000/uploads/${img}`
        )
      : ["https://via.placeholder.com/800"];

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="rounded-3xl overflow-hidden shadow-lg">
          <ImageGallery images={images} />
        </div>

        <div className="mt-8 mb-6">
          <h1 className="text-3xl md:text-4xl font-semibold">{home.title}</h1>

          <p className="text-gray-500 mt-2">{home.address}</p>

          <div className="flex gap-6 text-sm text-gray-600 mt-3">
            <span>{home.guests || 4} guests</span>
            <span>{home.bedrooms || 2} bedrooms</span>
            <span>{home.beds || 2} beds</span>
            <span>{home.bathrooms || 1} baths</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold mb-3">About this place</h2>
              <p className="text-gray-700 leading-relaxed">{home.description}</p>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <HostInfo host={home.owner} />
            </section>

            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <Amenities amenities={home.amenities || []} />
            </section>

            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <Reviews reviews={home.reviews || []} />
            </section>

            <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <p className="text-gray-600 mb-4">{home.address}</p>

              {home.location ? (
                <PropertyMapView location={home.location} address={home.address} />
              ) : (
                <p className="text-sm text-gray-400">Map not available</p>
              )}
            </section>
          </div>

          <div className="sticky top-24 h-fit">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Rs {home.price}</h2>
                <span className="text-gray-500 text-sm">/ night</span>
              </div>

              <p className="text-red-500 text-sm mt-1 font-medium">
                Only {home.totalRooms || 3} rooms left
              </p>

              <div className="mt-5 space-y-3">
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                <input
                  type="number"
                  min="1"
                  value={selectedRooms}
                  onChange={(e) => setSelectedRooms(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <button
                onClick={handleReserve}
                className="w-full py-3 mt-6 rounded-xl font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition active:scale-95"
              >
                Reserve Now
              </button>

              <p className="text-xs text-gray-400 text-center mt-3">
                No payment required yet
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Similar stays</h2>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <SimilarHomes homes={similarHomes} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeDetails;
