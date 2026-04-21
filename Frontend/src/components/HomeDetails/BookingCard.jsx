import { useState } from "react";

function BookingCard({ price, roomsLeft, onReserve }) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);

  const handleReserve = () => {
    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkInDate >= checkOutDate) {
      alert("Check-out date must be after check-in date");
      return;
    }

    if (rooms > roomsLeft) {
      alert(`Only ${roomsLeft} rooms available`);
      return;
    }

    onReserve({
      checkIn: checkInDate.toISOString(),
      checkOut: checkOutDate.toISOString(),
      roomsBooked: rooms
    });
  };

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="border p-4 rounded-xl shadow-md sticky top-20 bg-white">
      <h2 className="text-xl font-semibold">₹{price} / night</h2>
      <p className="text-red-500 text-sm">Only {roomsLeft} rooms left</p>

      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-in Date
          </label>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={today}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Check-out Date
          </label>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || today}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Rooms
          </label>
          <select
            value={rooms}
            onChange={(e) => setRooms(Number(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent"
          >
            {Array.from({ length: Math.min(roomsLeft, 10) }, (_, i) => i + 1).map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={handleReserve}
        className="bg-black text-white w-full py-3 mt-4 rounded-lg hover:bg-gray-800 transition duration-200 font-medium"
      >
        Reserve Now
      </button>
    </div>
  );
}

export default BookingCard;