import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import redisClient from "../config/redis.js";
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

/**
 * Generates a JWT token for the authenticated user.
 * @param {string} userId - The user's database ID.
 * @returns {string} The signed JWT token.
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "10d",
  });
};

/**
 * User Registration Controller
 * Validates input, checks for existing user, creates a new user, and signs a token.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const register = async (req, res) => {
  try {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Check if user already exists
    const existingUser = await User.findOne({ email: validatedData.email });

    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Create user (password hashed automatically by pre-save hook)
    const user = await User.create(validatedData);

    // Generate payload and token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in milliseconds
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ success: false, message: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') });
    }
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * User Login Controller
 * Validates credentials, compares password, and signs a token.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const login = async (req, res) => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Check if user exists and retrieve password for comparison
    const user = await User.findOne({ email: validatedData.email }).select(
      "+password",
    );
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(validatedData.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days in milliseconds
    });

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "ZodError") {
      return res
        .status(400)
        .json({ success: false, message: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ') });
    }
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * User Logout Controller
 * Clears the cookie and blacklists the user's current token in Redis.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const logout = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (token) {
      // Blacklist token in Redis for 10 days (864000 seconds)
      // This matches the token expiration time.
      await redisClient.setEx(`blacklist:${token}`, 864000, "true");
    }

    // Clear the token cookie
    res.clearCookie("token");

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

/**
 * Get Current User Controller
 * Returns the currently authenticated user's profile minus the password.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("GetMe Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
