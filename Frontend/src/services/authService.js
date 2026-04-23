import api from "./api";

export const sendSignupOtp = async (payload) => {
  const { data } = await api.post("/auth/send-otp", payload);
  return data?.data || data;
};

export const verifySignupOtp = async (payload) => {
  const { data } = await api.post("/auth/verify-otp", payload);
  return data?.data || data;
};

export const register = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data?.data || data;
};

export const loginWithGoogle = async (payload) => {
  const { data } = await api.post("/auth/google", payload);
  return data?.data || data;
};

export const login = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data?.data || data;
};

export const becomeHost = async () => {
  const { data } = await api.patch("/auth/become-host");
  return data?.data || data;
};
