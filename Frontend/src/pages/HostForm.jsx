import { useState } from "react";

const HostForm = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    address: "",
    totalRooms: "",
    amenities: [],
    rules: "",
    images: []
  });

  const amenitiesList = [
    "WiFi",
    "AC",
    "Parking",
    "TV",
    "Fridge",
    "Kitchen",
    "Washing Machine"
  ];

  // ================= HANDLERS =================

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAmenities = (item) => {
    if (form.amenities.includes(item)) {
      setForm({
        ...form,
        amenities: form.amenities.filter((a) => a !== item)
      });
    } else {
      setForm({
        ...form,
        amenities: [...form.amenities, item]
      });
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setForm({ ...form, images: files });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!form.title || !form.price || !form.address) {
    alert("Please fill required fields");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("title", form.title);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("address", form.address);
    formData.append("totalRooms", form.totalRooms);
    formData.append("rules", form.rules);

    form.amenities.forEach((a) => {
      formData.append("amenities", a);
    });

    form.images.forEach((img) => {
      formData.append("images", img);
    });

    const res = await fetch("http://localhost:5000/api/properties", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    console.log("RESPONSE:", data);

    if (res.ok) {
      alert("Property added successfully");
    } else {
      alert(data.message || "Something went wrong");
    }

  } catch (err) {
    console.error(err);
    alert("Error submitting property");
  }
};

  // ================= UI =================

  return (
    <div className="min-h-screen bg-[#d6d] to-gray-800 text-black flex justify-center px-4 py-10">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 space-y-8"
      >
        <h2 className="text-3xl font-bold text-center">
          Host Your Property
        </h2>

        {/* BASIC INFO */}
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Property Title"
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none"
            onChange={handleChange}
          />

          <textarea
            name="description"
            placeholder="Description"
            rows={4}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 focus:outline-none"
            onChange={handleChange}
          />
        </div>

        {/* PRICE + LOCATION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            name="price"
            placeholder="Price per night"
            className="p-3 rounded-xl bg-white/5 border border-white/10"
            onChange={handleChange}
          />

          <input
            type="text"
            name="address"
            placeholder="Location"
            className="p-3 rounded-xl bg-white/5 border border-white/10"
            onChange={handleChange}
          />
        </div>

        {/* ROOMS */}
        <input
          type="number"
          name="totalRooms"
          placeholder="Total Rooms"
          className="w-full p-3 rounded-xl bg-white border border-white/1"
          onChange={handleChange}
        />

        {/* AMENITIES */}
        <div>
          <p className="mb-3 text-gray-950">Amenities</p>

          <div className="flex flex-wrap gap-3">
            {amenitiesList.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => handleAmenities(item)}
                className={`px-4 py-2 rounded-full text-sm transition 
                ${
                  form.amenities.includes(item)
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-white text-gray-300 border border-white/10"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <p className="mb-2 text-gray">Upload Images</p>

          <input
            type="file"
            multiple
            onChange={handleImageUpload}
            className="text-gray-300"
          />

          {/* PREVIEW */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {form.images.map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  alt="preview"
                  className="h-24 w-full object-cover text-black rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        {/* RULES */}
        <textarea
          name="rules"
          placeholder="Property Rules (e.g. No smoking, No pets)"
          rows={3}
          className="w-full p-3 rounded-xl bg-white border border-white/10"
          onChange={handleChange}
        />

        {/* SUBMIT */}
        <button
          type="submit"
          className="w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 transition font-semibold shadow-lg"
        >
          Submit Property
        </button>

      </form>
    </div>
  );
};

export default HostForm;