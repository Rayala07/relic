import { createPublicKey } from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * Fix #1 — Verifies the Supabase JWT locally using the JWKS public key.
 *
 * Supabase now signs JWTs with ECC (P-256) → ES256 algorithm.
 * We fetch the public key from Supabase's JWKS endpoint ONCE on first use,
 * cache it in memory, and verify all subsequent tokens in-process (<1ms).
 *
 * BEFORE: Every request → live HTTP call to Supabase /auth/v1/user → ~200ms
 * AFTER:  First request → fetch JWKS (one-time) → cache public key
 *         Every subsequent request → jwt.verify() in-process → <1ms
 */

let _cachedPublicKey = null;

async function getPublicKey() {
  if (_cachedPublicKey) return _cachedPublicKey;

  // Supabase exposes its JWKS at this well-known endpoint
  const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
  if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);

  const { keys } = await res.json();
  if (!keys?.length) throw new Error("JWKS response contained no keys");

  // Convert the JWK to a Node.js KeyObject — works with jsonwebtoken's verify
  _cachedPublicKey = createPublicKey({ format: "jwk", key: keys[0] });
  console.log("[AUTH] JWKS public key loaded and cached");
  return _cachedPublicKey;
}

export const verifyToken = [
  async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ success: false, message: "Authentication required" });
      }

      const token = authHeader.split(" ")[1];

      // Verify signature and expiry locally using the cached JWKS public key
      const publicKey = await getPublicKey();
      const decoded = jwt.verify(token, publicKey, { algorithms: ["ES256"] });

      const supabaseUserId = decoded.sub;
      req.userId = supabaseUserId;

      // Fix #5 — JIT Provisioning: single atomic upsert.
      // $setOnInsert only writes on first-time creation; existing users pay zero write cost.
      // Catch E11000: if the email unique index fires, the user already exists — safe to continue.
      const email = decoded.email || "";
      const name = decoded.user_metadata?.first_name || email.split("@")[0] || "Unknown User";
      try {
        await User.findByIdAndUpdate(
          supabaseUserId,
          { $setOnInsert: { name, email } },
          { upsert: true }
        );
      } catch (err) {
        if (err.code !== 11000) throw err;
      }

      next();
    } catch (error) {
      console.error("[AUTH] JWT Verification Error:", error.message);
      return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
  }
];
