import { useNavigate } from "react-router-dom";

function HomeCard({ home, type = "featured" }) {
  const navigate = useNavigate();
  const canOpenHome = Boolean(home?._id);

  const openHome = () => {
    if (canOpenHome) {
      navigate(`/homes/${home._id}`);
    }
  };

  const imageSrc = home?.images?.[0]
    ? home.images[0].startsWith("http")
      ? home.images[0]
      : `http://localhost:5000/uploads/${home.images[0]}`
    : home?.imageURL
      ? home.imageURL
      : home?.image || "https://via.placeholder.com/400x300?text=House";

  return (
    <div
      className={`bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition duration-300 group ${
        canOpenHome ? "cursor-pointer" : ""
      }`}
      onClick={openHome}
    >
      <div className="relative">
        <img
          src={imageSrc}
          alt={home.houseName || home.title}
          className="w-full h-52 object-cover group-hover:scale-105 transition duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/400x300?text=House";
          }}
        />

        <div className="absolute top-3 right-3 bg-black px-2 py-1 text-xs font-semibold rounded-md shadow">
          ⭐ {home.displayRating || home.rating || 4.5}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-1">
        <h3 className="text-lg font-semibold text-gray-900 truncate">
          {home.houseName || home.title}
        </h3>

        <p className="text-sm text-gray-500">
          {home.city || home.address || home.location}
        </p>

        <p className="text-base font-semibold text-black mt-1">
          Rs {home.price}
          <span className="text-sm text-gray-500 font-normal"> / night</span>
        </p>

        {type === "full" && (
          <>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {home.description}
            </p>

            <button
              onClick={(event) => {
                event.stopPropagation();
                navigate(`/homes/${home._id}`);
              }}
              className="mt-3 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
            >
              View Details
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default HomeCard;
