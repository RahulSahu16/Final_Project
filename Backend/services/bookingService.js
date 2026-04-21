import crypto from "crypto";
import Booking from "../models/Booking.js";
import Property from "../models/Property.js";
import { getRazorpayClient } from "../config/razorpay.js";
import AppError from "../utils/appError.js";

export const createBooking = async (payload, userId) => {
  const { propertyId, roomsBooked, checkIn, checkOut } = payload;
  const property = await Property.findById(propertyId);
  if (!property) throw new AppError("Property not found", 404);
  if (property.totalRooms < roomsBooked) throw new AppError("Not enough rooms available", 400);

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (checkInDate >= checkOutDate) throw new AppError("Check-out must be after check-in", 400);
  if (checkInDate < new Date()) throw new AppError("Check-in cannot be in the past", 400);

  const totalPrice = Number(property.price) * Number(roomsBooked);
  return Booking.create({
    userId,
    propertyId,
    roomsBooked,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    totalPrice,
    status: "pending",
  });
};

export const createPaymentOrder = async ({ bookingId }, userId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.userId.toString() !== userId.toString()) throw new AppError("Unauthorized", 403);

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw new AppError("Razorpay is not configured on server", 500);
  }

  const order = await razorpay.orders.create({
    amount: Math.round(booking.totalPrice * 100),
    currency: "INR",
    receipt: `booking_${booking._id}`,
  });

  booking.orderId = order.id;
  await booking.save();

  return {
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    key: process.env.RAZORPAY_KEY_ID,
  };
};

export const verifyPayment = async (payload, userId) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = payload;
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.userId.toString() !== userId.toString()) throw new AppError("Unauthorized", 403);

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new AppError("Payment signature verification failed", 400);
  }

  booking.status = "confirmed";
  booking.orderId = razorpay_order_id;
  booking.paymentId = razorpay_payment_id;
  await booking.save();

  await Property.findByIdAndUpdate(booking.propertyId, {
    $inc: { totalRooms: -booking.roomsBooked },
  });

  return booking;
};
