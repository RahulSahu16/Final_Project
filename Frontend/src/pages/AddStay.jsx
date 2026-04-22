import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MapPicker from "../components/MapPicker";
import { createProperty, updateProperty } from "../services/propertyService";

const locationOptions = {
  India: [
    "Andaman and Nicobar Islands",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chandigarh",
    "Chhattisgarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jammu and Kashmir",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Ladakh",
    "Lakshadweep",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Puducherry",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
  ],
  "United States": [
    "California",
    "Florida",
    "Illinois",
    "New Jersey",
    "New York",
    "Texas",
    "Washington",
  ],
  Canada: ["Alberta", "British Columbia", "Manitoba", "Ontario", "Quebec"],
  Australia: [
    "New South Wales",
    "Queensland",
    "South Australia",
    "Victoria",
    "Western Australia",
  ],
  "United Kingdom": ["England", "Northern Ireland", "Scotland", "Wales"],
};

const emptyForm = {
  title: "",
  description: "",
  price: "",
  country: "",
  state: "",
  city: "",
  address: "",
  location: null,
  totalRooms: "",
  amenities: [],
  rules: "",
  images: [],
};

const AddStay = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingProperty = location.state?.property || null;
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [form, setForm] = useState(emptyForm);

  const amenitiesList = [
    "Free WiFi",
  "Air Conditioning",
  "Heating",
  "Television",
  "Satellite Channels",
  "Room Service",
  "Daily Housekeeping",
  "Laundry Service",
  "Dry Cleaning",
  "Ironing Service",
  "24-Hour Front Desk",
  "Concierge Service",
  "Luggage Storage",
  "Elevator",
  "Non-Smoking Rooms",
  "Smoking Rooms",
  "Family Rooms",
  "Soundproof Rooms",
  "Interconnecting Rooms",
  "Private Bathroom",
  "Bathtub",
  "Shower",
  "Hot Water",
  "Free Toiletries",
  "Hair Dryer",
  "Towels",
  "Bathrobes",
  "Slippers",
  "Minibar",
  "Refrigerator",
  "Microwave",
  "Electric Kettle",
  "Coffee Maker",
  "Complimentary Breakfast",
  "Restaurant",
  "Bar",
  "Snack Bar",
  "Packed Lunches",
  "Special Diet Meals",
  "Swimming Pool",
  "Outdoor Pool",
  "Indoor Pool",
  "Kids Pool",
  "Spa",
  "Wellness Center",
  "Massage",
  "Sauna",
  "Steam Room",
  "Fitness Center",
  "Gym",
  "Yoga Room",
  "Garden",
  "Terrace",
  "Sun Deck",
  "BBQ Facilities",
  "Fireplace",
  "Business Center",
  "Meeting Rooms",
  "Conference Hall",
  "Banquet Hall",
  "Fax/Photocopying",
  "Free Parking",
  "Valet Parking",
  "Accessible Parking",
  "Airport Shuttle",
  "Car Rental",
  "Taxi Service",
  "Bicycle Rental",
  "EV Charging Station",
  "Wheelchair Accessible",
  "Facilities for Disabled Guests",
  "Braille Signage",
  "Pet Friendly",
  "Pet Basket",
  "Pet Bowls",
  "Kids Play Area",
  "Babysitting Service",
  "Kids Club",
  "Game Room",
  "Board Games",
  "Nightclub",
  "Live Entertainment",
  "Beach Access",
  "Private Beach",
  "Water Sports",
  "Ski Storage",
  "Ski Equipment Rental",
  "Golf Course",
  "Tennis Court",
  "Security",
  "CCTV",
  "Safe Deposit Box",
  "24-Hour Security",
  "Smoke Detectors",
  "Fire Extinguishers",
  "Key Card Access",
  "Currency Exchange",
  "ATM",
  "Gift Shop",
  "Salon",
  "Doctor on Call"
  ];

  useEffect(() => {
    if (!editingProperty) {
      setForm(emptyForm);
      return;
    }

    setForm({
      title: editingProperty.title || "",
      description: editingProperty.description || "",
      price: editingProperty.price || "",
      country: editingProperty.country || "",
      state: editingProperty.state || "",
      city: editingProperty.city || "",
      address: editingProperty.address || "",
      location: editingProperty.location || null,
      totalRooms: editingProperty.totalRooms || "",
      amenities: editingProperty.amenities || [],
      rules: editingProperty.rules || "",
      images: [],
    });
  }, [editingProperty]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setForm((prev) => ({
      ...prev,
      country: selectedCountry,
      state: "",
    }));
  };

  const handleAmenities = (item) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(item)
        ? prev.amenities.filter((a) => a !== item)
        : [...prev.amenities, item],
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({ ...prev, images: files }));
  };

  const handleLocationSelect = (coords) => {
    setForm((prev) => ({
      ...prev,
      location: { lat: coords.lat, lng: coords.lng },
      address: prev.address || coords.address || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (
      !form.title ||
      !form.description ||
      !form.price ||
      !form.country ||
      !form.state ||
      !form.city ||
      !form.address ||
      !form.totalRooms
    ) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    if (!form.location) {
      setErrorMessage("Please select the property location on the map.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("country", form.country);
      formData.append("state", form.state);
      formData.append("city", form.city);
      formData.append("address", form.address);
      formData.append("totalRooms", form.totalRooms);
      formData.append("rules", form.rules);
      formData.append("location", JSON.stringify(form.location));

      form.amenities.forEach((amenity) => {
        formData.append("amenities", amenity);
      });

      form.images.forEach((image) => {
        formData.append("images", image);
      });

      if (editingProperty?._id) {
        await updateProperty(editingProperty._id, formData);
        alert("Property updated successfully");
      } else {
        await createProperty(formData);
        alert("Property added successfully");
      }

      navigate("/AllHomes");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message ||
          `Error ${editingProperty ? "updating" : "submitting"} property`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1eb] text-black flex justify-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white backdrop-blur-lg p-8 rounded-2xl border border-white/20 space-y-8"
      >
        <h2 className="text-3xl font-bold text-center">
          {editingProperty ? "Edit Your Stay" : "Add Your Stay"}
        </h2>
        {errorMessage ? (
          <p className="text-sm text-red-700">{errorMessage}</p>
        ) : null}

        <div className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Property Title"
            value={form.title}
            className="w-full p-3 rounded-xl border border-[#6f5e30] bg-[#f7f6f4]"
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Description"
            rows={4}
            value={form.description}
            className="w-full p-3 rounded-xl border border-[#6f5e30] bg-[#f7f6f4]"
            onChange={handleChange}
          />
        </div>

        <input
          type="number"
          name="price"
          placeholder="Price per night"
          value={form.price}
          className="w-full p-3 rounded-xl border border-[#6f5e30] bg-[#f7f6f4]"
          onChange={handleChange}
        />

        <select
          name="country"
          value={form.country}
          className="w-full p-3 rounded-xl border border-[#6f5e30] bg-[#f7f6f4]"
          onChange={handleCountryChange}
        >
          <option value="">Select Country</option>
          {Object.keys(locationOptions).map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <select
          name="state"
          value={form.state}
          className="w-full p-3 rounded-xl border border-[#6f5e30] bg-[#f7f6f4] disabled:opacity-60"
          onChange={handleChange}
          disabled={!form.country}
        >
          <option value="">
            {form.country ? "Select State" : "Select Country First"}
          </option>
          {(locationOptions[form.country] || []).map((stateName) => (
            <option key={stateName} value={stateName}>
              {stateName}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          className="w-full p-3 rounded-xl border border-[#6f5e30] bg-[#f7f6f4]"
          onChange={handleChange}
        />

        <textarea
          name="address"
          placeholder="Full Address (Street, Area, Landmark)"
          value={form.address}
          rows={4}
          className="w-full p-3 rounded-xl border border-[#6f5e30] bg-[#f7f6f4]"
          onChange={handleChange}
        />

        <div className="space-y-3">
          <div className="w-full h-[300px] rounded-xl overflow-hidden border border-[#6f5e30]/40 bg-white/30">
            <MapPicker value={form.location} onChange={handleLocationSelect} />
          </div>

          {form.location ? (
            <p className="text-sm text-gray-700">
              Selected location: {form.location.lat}, {form.location.lng}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              Click on the map to save the exact property location.
            </p>
          )}
        </div>

        <input
          type="number"
          name="totalRooms"
          placeholder="Total Rooms"
          value={form.totalRooms}
          className="w-full p-3 rounded-xl border border-[#6f5e30] bg-[#f7f6f4]"
          onChange={handleChange}
        />

        <div>
          <p className="mb-3 font-medium">Amenities</p>

          <div className="flex flex-wrap gap-3">
            {amenitiesList.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => handleAmenities(item)}
                className={`px-4 py-2 rounded-full text-sm transition border-[#6f5e30] ${
                  form.amenities.includes(item)
                    ? "bg-[#a58d5c] text-white"
                    : "bg-white text-gray-600 border"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="w-full p-3 rounded-xl border border-[#6f5e30] bg-[#f7f6f4]">
            {editingProperty ? "Upload New Images (optional)" : "Upload Images"}
          </p>

          <input type="file" multiple onChange={handleImageUpload} />

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4 ">
              {form.images.map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="h-24 w-full object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        <textarea
          name="rules"
          placeholder="Property Rules"
          value={form.rules}
          className="w-full p-3 rounded-xl border border-[#6f5e30] bg-[#f7f6f4]"
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-[#6f5e30] hover:bg-[#5a4b26] text-white disabled:opacity-60"
        >
          {loading
            ? editingProperty
              ? "Updating..."
              : "Submitting..."
            : editingProperty
              ? "Update Property"
              : "Submit Property"}
        </button>
      </form>
    </div>
  );
};

export default AddStay;
