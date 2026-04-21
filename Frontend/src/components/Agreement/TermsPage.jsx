import { useState } from "react";
import { useNavigate } from "react-router-dom";

// ✅ constants (move to separate file later)
const STORAGE_KEYS = {
  TERMS_ACCEPTED: "agreedToTerms",
};

const ROUTES = {
  HOST_FORM: "/host-form",
};

// ✅ move this to constants/data file later
const TERMS_LIST = [
  "You must provide accurate property details",
  "No illegal activities allowed",
  "You are responsible for bookings",
  "Platform is not liable for disputes",
  "Misleading listings can be removed anytime",
  "Users must respect guests and local laws",
];

const TermsPage = () => {
  const [isAccepted, setIsAccepted] = useState(false);
  const navigate = useNavigate();

  const handleCheckboxChange = (e) => {
    setIsAccepted(e.target.checked);
  };

  const handleContinue = () => {
    if (!isAccepted) return;

    // ✅ isolate side-effect
    saveTermsAcceptance();
    navigate(ROUTES.HOST_FORM);
  };

  const saveTermsAcceptance = () => {
    localStorage.setItem(STORAGE_KEYS.TERMS_ACCEPTED, "true");
  };

  return (
    <div className="min-h-screen bg-[#d6d1c3] flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-[#b9b4a5] rounded-2xl shadow-xl p-8 border border-white/20">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-black mb-6 text-center">
          Terms & Conditions
        </h2>

        {/* Terms Box */}
        <div className="h-60 overflow-y-auto bg-black/5 border border-white/10 rounded-xl p-4 text-black text-sm leading-relaxed space-y-2">
          {TERMS_LIST.map((term, index) => (
            <p key={index}>• {term}</p>
          ))}
        </div>

        {/* Checkbox */}
        <div className="flex items-center gap-3 mt-6">
          <input
            id="terms-checkbox"
            type="checkbox"
            checked={isAccepted}
            onChange={handleCheckboxChange}
            className="w-5 h-5 accent-blue-500 cursor-pointer"
          />
          <label htmlFor="terms-checkbox" className="text-sm">
            I agree to the Terms & Conditions
          </label>
        </div>

        {/* Button */}
        <button
          onClick={handleContinue}
          disabled={!isAccepted}
          className={`w-full mt-6 py-3 rounded-xl font-semibold transition-all duration-300 
            ${
              isAccepted
                ? "bg-[#d6d1c3] hover:bg-[#948b72] text-white shadow-lg"
                : "bg-gray-600 text-gray-300 cursor-not-allowed"
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default TermsPage;