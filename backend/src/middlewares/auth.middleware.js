import { ClerkExpressRequireAuth, createClerkClient } from "@clerk/clerk-sdk-node";
import User from "../models/user.model.js";
import "dotenv/config";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * Just-In-Time (JIT) Provisioning Middleware.
 * This runs after Clerk has verified the token.
 * It checks if the Clerk user exists in our MongoDB. If not, it creates them.
 */
const syncUserToDatabase = async (req, res, next) => {
  try {
    const clerkId = req.auth?.userId;

    if (!clerkId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    // Attach the clerkId to req.userId so all downstream controllers continue to work normally
    req.userId = clerkId;

    // Check if the user already exists in our MongoDB
    const existingUser = await User.findById(clerkId);
    
    if (!existingUser) {
      // User is new to our backend. Fetch their details from Clerk.
      const clerkUser = await clerkClient.users.getUser(clerkId);
      
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const name = clerkUser.firstName 
        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
        : email.split("@")[0] || "Unknown User";

      // Create them in our database using the Clerk ID as the primary key
      await User.create({
        _id: clerkId,
        name,
        email,
      });
      
      console.log(`[AUTH] JIT Provisioned new user: ${clerkId}`);
    }

    next();
  } catch (error) {
    console.error("[AUTH] JIT Provisioning Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error during auth sync" });
  }
};

/**
 * We export verifyToken as an array of middlewares.
 * Express allows arrays of middlewares to be passed to routes.
 * 1. ClerkExpressRequireAuth checks the Authorization Bearer token.
 * 2. syncUserToDatabase ensures the user exists in MongoDB.
 */
export const verifyToken = [
  ClerkExpressRequireAuth(),
  syncUserToDatabase
];
