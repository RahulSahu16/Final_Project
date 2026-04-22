import { useNavigate } from "react-router-dom";

function PopularDestinations() {
  const navigate = useNavigate();

  const cities = [
    { name: "Goa", image: "https://img.freepik.com/premium-photo/sunset-baga-beach-goa_926199-2493040.jpg?semt=ais_hybrid&w=740&q=80" },
    { name: "Manali", image: "https://wallpaperaccess.com/full/3548729.jpg" },
    { name: "Jaipur", image: "https://c4.wallpaperflare.com/wallpaper/754/557/317/palace-of-the-winds-jaipur-rajasthan-india-wallpaper-preview.jpg" },
    { name: "Udaipur", image: "https://t4.ftcdn.net/jpg/00/85/61/27/360_F_85612737_veoCTufAsIuYJC8rjs06CA4HrLw30r8l.jpg" },
    { name: "Kerala", image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8a2VyYWxhfGVufDB8fDB8fHww" },
    { name: "Rishikesh", image: "https://t4.ftcdn.net/jpg/12/45/31/73/360_F_1245317300_wYEe6TwI4ojLt0w9MRleFtPYKZgloUSY.jpg" },
    { name: "Mumbai", image: "https://wallpapers.com/images/hd/mumbai-2560-x-1600-background-tamrf8fvq3vad3b2.jpg" },
  ];

  const handleClick = (city) => {
    navigate(`/search?city=${city.toLowerCase()}`);
  };

  return (
    <div className="px-10 mt-16">
      <h2 className="text-2xl font-bold mb-6 text-black">
        Popular Destinations
      </h2>

      {/* Horizontal Scroll */}
      <div className="flex gap-6 overflow-x-auto scrollbar-hide">
        {cities.map((city) => (
          <div
            key={city.name}
            onClick={() => handleClick(city.name)}
            className="min-w-[200px] cursor-pointer"
          >
            <img
              src={city.image}
              alt={city.name}
              className="w-full h-40 object-cover rounded-lg"
            />

            <p className="mt-2 text-center font-medium text-black">
              {city.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PopularDestinations;