import { useNavigate } from "react-router-dom";

function SimilarHomes({ homes }) {
  const navigate = useNavigate();

  if (!homes || homes.length === 0) {
    return (
      <p className="text-gray-500 mt-6 text-center">
        No similar homes found
      </p>
    );
  }

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-6">Similar Homes</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {homes.map((item) => {
          const image = item.images?.[0]
            ? item.images[0].startsWith("http")
              ? item.images[0]
              : `http://localhost:5000/uploads/${item.images[0]}`
            : "https://via.placeholder.com/640x480?text=House";

          return (
            <button
              key={item._id}
              type="button"
              onClick={() => navigate(`/homes/${item._id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition text-left"
            >
              <img
                src={image}
                className="h-40 w-full object-cover"
                alt={item.title}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://via.placeholder.com/640x480?text=House";
                }}
              />

              <div className="p-4">
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-sm text-gray-500">Rs {item.price} / night</p>
                <p className="text-sm text-gray-400 mt-1">{item.address}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default SimilarHomes;
