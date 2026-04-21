import api from "./api";

export const createBooking = async (payload) => {
  const { data } = await api.post("/bookings", payload);
  return data.data.booking;
};

export const createPaymentOrder = async (payload) => {
  const { data } = await api.post("/bookings/payment/order", payload);
  return data.data.order;
};

export const verifyPayment = async (payload) => {
  const { data } = await api.post("/bookings/payment/verify", payload);
  return data.data.booking;
};
