import axios from "axios";
import User from "../models/user.model.js";

/**
 * Verifies the Supabase JWT token and attaches the user ID to the request.
 * Uses the Supabase REST API to guarantee the token hasn't been revoked.
 */
export const verifyToken = [
  async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      const token = authHeader.split(" ")[1];

      // Call Supabase API to get the user and verify the token is active
      const response = await axios.get(`${process.env.SUPABASE_URL}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: process.env.SUPABASE_ANON_KEY,
        },
      });

      const supabaseUser = response.data;
      const supabaseUserId = supabaseUser.id;
      
      // Attach the ID for downstream controllers
      req.userId = supabaseUserId;

      // Fix #5 — JIT Provisioning: single atomic upsert instead of findById + conditional create.
      // $setOnInsert only writes on first-time creation; existing users pay zero write cost.
      const email = supabaseUser.email || "";
      const name = supabaseUser.user_metadata?.first_name || email.split("@")[0] || "Unknown User";
      await User.findByIdAndUpdate(
        supabaseUserId,
        { $setOnInsert: { name, email } },
        { upsert: true, new: false }
      );

      next();
    } catch (error) {
      console.error("[AUTH] JWT Verification Error:", error.response?.data || error.message);
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  }
];
