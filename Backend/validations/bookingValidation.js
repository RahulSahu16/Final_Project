import Joi from "joi";

export const createBookingSchema = Joi.object({
  propertyId: Joi.string().required(),
  checkIn: Joi.date().iso().required(),
  checkOut: Joi.date().iso().required(),
  roomsBooked: Joi.number().integer().min(1).required(),
});

export const createPaymentOrderSchema = Joi.object({
  bookingId: Joi.string().required(),
});

export const verifyPaymentSchema = Joi.object({
  bookingId: Joi.string().required(),
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
});
