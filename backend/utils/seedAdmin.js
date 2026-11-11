const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("../config/db");
const User = require("../models/User");

// Load environment variables from backend/.env
dotenv.config();

/**
 * Secure One-Time Admin Seed Script
 *
 * Reads admin credentials from environment variables:
 *  - ADMIN_NAME (optional, defaults to "System Administrator")
 *  - ADMIN_EMAIL (required)
 *  - ADMIN_PASSWORD (required, minimum 6 characters)
 *  - ADMIN_PHONE (optional)
 *
 * Security guarantees:
 *  - Passwords are never hardcoded.
 *  - Automatically hashed via the User model's bcrypt pre-save hook.
 *  - Never logs or exposes plain-text passwords or connection secrets.
 *  - Checks for existing accounts to prevent duplicate admins.
 *  - Preserves existing customer accounts without modification.
 */
const seedAdmin = async () => {
  const adminName = (process.env.ADMIN_NAME || "System Administrator").trim();
  const adminEmail = process.env.ADMIN_EMAIL ? process.env.ADMIN_EMAIL.trim().toLowerCase() : "";
  const adminPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : "";
  const adminPhone = process.env.ADMIN_PHONE ? process.env.ADMIN_PHONE.trim() : "";

  // 1. Validate environment inputs without exposing sensitive values
  if (!adminEmail || !adminPassword) {
    console.error("\n=======================================================");
    console.error("❌ ERROR: Missing required admin environment variables!");
    console.error("=======================================================");
    console.error("Please provide ADMIN_EMAIL and ADMIN_PASSWORD.\n");
    console.error("Safe Usage Examples:");
    console.error("  PowerShell (Current Session):");
    console.error('    $env:ADMIN_NAME="System Administrator"');
    console.error('    $env:ADMIN_EMAIL="admin@foodie.com"');
    console.error('    $env:ADMIN_PASSWORD="YourSecurePasswordHere"');
    console.error("    npm run seed:admin\n");
    console.error("  Linux / macOS / Bash:");
    console.error('    ADMIN_NAME="Admin" ADMIN_EMAIL="admin@foodie.com" ADMIN_PASSWORD="YourSecurePasswordHere" npm run seed:admin\n');
    console.error("  Or add them temporarily to backend/.env.");
    console.error("=======================================================\n");
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
  if (!emailRegex.test(adminEmail)) {
    console.error("\n❌ ERROR: Invalid ADMIN_EMAIL format. Please provide a valid email address.\n");
    process.exit(1);
  }

  // Validate password length
  if (adminPassword.length < 6) {
    console.error("\n❌ ERROR: ADMIN_PASSWORD must be at least 6 characters long.\n");
    process.exit(1);
  }

  let dbConnection = null;

  try {
    console.log("\n⏳ Connecting to MongoDB Atlas...");
    dbConnection = await connectDB();

    // 2. Check if a user with this email already exists
    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      if (existingUser.role === "admin") {
        console.log("\n=======================================================");
        console.log("ℹ️  ADMIN ACCOUNT ALREADY EXISTS");
        console.log("=======================================================");
        console.log(`👤 Name:    ${existingUser.name}`);
        console.log(`📧 Email:   ${existingUser.email}`);
        console.log(`🛡️  Role:    ${existingUser.role}`);
        console.log(`🆔 ID:      ${existingUser._id}`);
        console.log("Creation aborted to prevent duplicate admin accounts.");
        console.log("=======================================================\n");
      } else {
        console.warn("\n=======================================================");
        console.warn("⚠️  NOTICE: ACCOUNT CONFLICT");
        console.warn("=======================================================");
        console.warn(`An account with email "${adminEmail}" already exists with role: "${existingUser.role}".`);
        console.warn("Customer accounts are preserved and cannot be overwritten by this script.");
        console.warn("To create an admin, please use a distinct admin email address or promote");
        console.warn("the customer account directly in your MongoDB Atlas dashboard.");
        console.warn("=======================================================\n");
      }

      await mongoose.disconnect();
      process.exit(0);
    }

    // 3. Create admin user (Pre-save hook in User model automatically hashes the password with bcrypt)
    console.log("🔒 Hashing password securely with bcrypt...");
    const newAdmin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      phone: adminPhone
    });

    console.log("\n=======================================================");
    console.log("🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY!");
    console.log("=======================================================");
    console.log(`👤 Name:       ${newAdmin.name}`);
    console.log(`📧 Email:      ${newAdmin.email}`);
    console.log(`🛡️  Role:       ${newAdmin.role}`);
    console.log(`🆔 User ID:    ${newAdmin._id}`);
    console.log("🔒 Password:   [SECURELY HASHED WITH BCRYPT - NEVER STORED IN PLAIN TEXT]");
    console.log(`📅 Created At:   ${newAdmin.createdAt}`);
    console.log("=======================================================");
    console.log("👉 You can now log in via http://localhost:5173 or POST /api/auth/login\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ FAILED TO SEED ADMIN ACCOUNT:", error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect().catch(() => {});
    }
    process.exit(1);
  }
};

// Execute seed function
seedAdmin();
