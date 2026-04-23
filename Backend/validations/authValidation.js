import Joi from "joi";

export const sendOtpSchema = Joi.object({
  email: Joi.string().trim().email().required(),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  otp: Joi.string().trim().length(6).pattern(/^\d+$/).required(),
});

export const registerSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  firstName: Joi.string().trim().min(2).max(30).required(),
  lastName: Joi.string().trim().min(1).max(30).required(),
  password: Joi.string().min(6).max(64).required(),
});

export const googleAuthSchema = Joi.object({
  idToken: Joi.string().trim().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});
