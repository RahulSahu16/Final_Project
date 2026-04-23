const GOOGLE_SCRIPT_ID = "google-identity-services";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export const loadGoogleIdentityScript = () =>
  new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google);
      return;
    }

    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google script.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Failed to load Google script."));
    document.head.appendChild(script);
  });

export const requestGoogleIdToken = async () => {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error("Google login is not configured. Add VITE_GOOGLE_CLIENT_ID in frontend env.");
  }

  const google = await loadGoogleIdentityScript();

  return new Promise((resolve, reject) => {
    let settled = false;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        settled = true;
        if (response?.credential) {
          resolve(response.credential);
          return;
        }
        reject(new Error("Google authentication was cancelled."));
      },
    });

    try {
      google.accounts.id.prompt();
      window.setTimeout(() => {
        if (!settled) {
          reject(new Error("Google login prompt did not open. Please allow Google popups and try again."));
        }
      }, 5000);
    } catch {
      reject(new Error("Unable to open Google login prompt."));
    }
  });
};
