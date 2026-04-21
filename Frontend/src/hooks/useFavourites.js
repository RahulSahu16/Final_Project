import { useEffect, useState } from "react";

const FAVOURITES_STORAGE_KEY = "favourites";
const FAVOURITES_UPDATED_EVENT = "favourites-updated";

const normalizeFavouriteId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "object") {
    return value._id ? String(value._id) : null;
  }

  return String(value);
};

const normalizeFavouriteIds = (value) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.map(normalizeFavouriteId).filter(Boolean))];
};

export const readFavourites = () => {
  try {
    const stored = localStorage.getItem(FAVOURITES_STORAGE_KEY);
    return stored ? normalizeFavouriteIds(JSON.parse(stored)) : [];
  } catch (error) {
    console.error("Error reading favourites:", error);
    return [];
  }
};

export const writeFavourites = (value) => {
  const next = normalizeFavouriteIds(value);
  localStorage.setItem(FAVOURITES_STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(FAVOURITES_UPDATED_EVENT));
  return next;
};

export function useFavourites() {
  const [favourites, setFavourites] = useState(() => readFavourites());

  useEffect(() => {
    const syncFavourites = () => {
      setFavourites(readFavourites());
    };

    window.addEventListener("storage", syncFavourites);
    window.addEventListener(FAVOURITES_UPDATED_EVENT, syncFavourites);

    return () => {
      window.removeEventListener("storage", syncFavourites);
      window.removeEventListener(FAVOURITES_UPDATED_EVENT, syncFavourites);
    };
  }, []);

  const toggleFavourite = (homeId) => {
    const normalizedId = normalizeFavouriteId(homeId);
    if (!normalizedId) {
      return;
    }

    setFavourites((prev) => {
      const next = prev.includes(normalizedId)
        ? prev.filter((id) => id !== normalizedId)
        : [...prev, normalizedId];

      return writeFavourites(next);
    });
  };

  return { favourites, toggleFavourite };
}
