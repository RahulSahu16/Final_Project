import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import OTP from "../models/otpModel.js";
import AppError from "../utils/appError.js";
import sendEmail from "../utils/sendEmail.js";

const signToken = (user) =>
  jwt.sign({ id: user._id, roles: user.roles }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const normalizeEmail = (email) => email.trim().toLowerCase();

const buildDisplayName = (firstName, lastName, fallbackName = "") => {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  return fullName || fallbackName.trim();
};

const shapeUser = (user) => {
  const firstName = user.firstName || user.name?.split(" ").filter(Boolean)[0] || "";
  const derivedLastName = user.name
    ?.split(" ")
    .filter(Boolean)
    .slice(1)
    .join(" ");
  const lastName = user.lastName || derivedLastName || "";

  return {
    id: user._id,
    name: buildDisplayName(firstName, lastName, user.name || ""),
    firstName,
    lastName,
    email: user.email,
    roles: user.roles,
  };
};

const generateOtp = () => `${Math.floor(100000 + Math.random() * 900000)}`;

export const sendOtp = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await OTP.deleteMany({ email: normalizedEmail });
  await OTP.create({
    email: normalizedEmail,
    otp,
    expiresAt,
    isVerified: false,
  });

  try {
    await sendEmail({
      to: normalizedEmail,
      subject: "Your Cozy Stay OTP",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Verify your email</h2>
          <p>Your OTP for Cozy Stay signup is:</p>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `,
    });
  } catch (error) {
    await OTP.deleteMany({ email: normalizedEmail });
    throw new AppError("Unable to send OTP right now. Please try again later.", 500);
  }

  return {
    email: normalizedEmail,
    expiresAt,
  };
};

export const verifyOtp = async ({ email, otp }) => {
  const normalizedEmail = normalizeEmail(email);
  const otpEntry = await OTP.findOne({ email: normalizedEmail }).sort({ createdAt: -1 });

  if (!otpEntry) {
    throw new AppError("OTP not found. Please request a new OTP.", 404);
  }

  if (otpEntry.expiresAt < new Date()) {
    await OTP.deleteMany({ email: normalizedEmail });
    throw new AppError("OTP has expired. Please request a new OTP.", 400);
  }

  if (otpEntry.otp !== otp.trim()) {
    throw new AppError("Invalid OTP. Please try again.", 400);
  }

  otpEntry.isVerified = true;
  await otpEntry.save();

  return {
    email: normalizedEmail,
    verified: true,
  };
};

export const registerUser = async ({ email, firstName, lastName, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const otpEntry = await OTP.findOne({
    email: normalizedEmail,
    isVerified: true,
    expiresAt: { $gt: new Date() },
  }).sort({ updatedAt: -1, createdAt: -1 });

  if (!otpEntry) {
    throw new AppError("Please verify your email with OTP before creating the account.", 400);
  }

  const name = buildDisplayName(firstName, lastName);
  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    name,
    email: normalizedEmail,
    password: hashedPassword,
  });

  await OTP.deleteMany({ email: normalizedEmail });

  return {
    token: signToken(user),
    user: shapeUser(user),
  };
};

export const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  let isMatch = false;
  const storedPassword = user.password || "";

  if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
    isMatch = await bcrypt.compare(password, storedPassword);
  } else {
    isMatch = storedPassword === password;

    if (isMatch) {
      user.password = await bcrypt.hash(password, 12);
      await user.save();
    }
  }

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  return {
    token: signToken(user),
    user: shapeUser(user),
  };
};

export const becomeHost = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { roles: "host" } },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};
