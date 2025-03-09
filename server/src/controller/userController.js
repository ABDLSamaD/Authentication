const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../utils/sendMail");
const { userInfo } = require("os");
require("dotenv").config();

const generateOTP = () => {
  const otp = (crypto.randomBytes(3).readUIntBE(0, 3) % 900000) + 100000;
  return otp.toString(); // Generates a 6-digit OTP
};

exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ type: "warning", message: "fileds required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ type: "error", message: "User already exists" });
    }
    const salt = bcrypt.genSalt(10);
    const hashedPassword = bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    if (!user) {
      return res
        .status(404)
        .json({ type: "error", message: "Something Occured!" });
    }

    const otp = generateOTP();
    const hashedOtp = bcrypt.hash(otp, salt);
    const otpExpires = Date.now() + 10 * 60 * 1000;
    user.otp = hashedOtp;
    user.otpExpires = otpExpires;
    user.otpAttempts = 0;

    console.log(`OTP for ${email}: ${otp}`);
    sendEmail(email, "OTP VERICATION", otp);

    const data = {
      user: {
        id: user._id,
      },
    };
    const token = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1h" });
    user.token = token;

    await user.save();

    res.status(200).json({
      type: "success",
      message: "Please verify with OTP sent to your email.",
    });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp) {
      return res.status(400).json({ type: "error", message: "otp required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ type: "error", message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ type: "error", message: "User is already verified" });
    }

    if (!user.otp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ type: "error", message: "OTP is invalid or expired" });
    }

    //   check if otp matches
    const isMatch = await bcrypt.compare(otp, user.otp);
    if (!isMatch) {
      user.otpAttempts += 1;
      await user.save();

      if (user.otpAttempts >= 3) {
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();
        return res.status(429).json({
          type: "error",
          message:
            "Too many attempts. OTP invalidated. Request a new one. after 1 hour",
        });
      }
      return res.status(400).json({
        type: "error",
        message: `Incorrect OTP. Attempt ${user.otpAttempts}/3`,
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.otpAttempts = 0;
    sendEmail(email, "OTP VERIFIED", "OTP verified success");

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    user.token = token;
    await user.save();
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error" });
  }
};

exports.signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(404)
        .json({ type: "error", message: "Fields required" });
    }

    if (req.session.user) {
      return res
        .status(400)
        .json({ type: "info", message: "User is already logged in." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ type: "error", message: "User not found" });
    }

    if (!users.isVerified) {
      return res.status(400).json({ type: "error", message: "Verify first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ type: "error", message: "Invalid credentials!" });
    }

    // Adjust token expiration based on rememberMe
    const tokenExpiry = rememberMe ? "30d" : "1d";
    const data = {
      user: {
        id: user.id,
      },
    };
    const token = jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn: tokenExpiry,
    });
    user.token = token;

    const sessionMaxAge = rememberMe
      ? 30 * 24 * 60 * 60 * 1000 // 30 days
      : 24 * 60 * 60 * 1000; // 1 day

    // Set session and token cookie
    req.session.cookie.maxAge = sessionMaxAge;

    res.cookie("auth_token", token, {
      httpOnly: true, // Prevent access from JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: sessionMaxAge,
    });

    req.session.token = token;
    req.session.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: "user",
    };

    sendEmail(user.email, "Login Success", "Login successfull");
    await user.save();
    res.status(200).json({ type: "success", message: "Login successfully" });
  } catch (error) {
    res.status(500).json({ type: "error", message: "Internal server error" });
  }
};

// logout functionallity
exports.logout = async (req, res) => {
  if (!req.session.user) {
    return res
      .status(401)
      .json({ type: "error", message: "Unauthorized. No active session." });
  }
  try {
    const user = await User.findById(req.session.user.id);
    user.token = null;
    await user.save();
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ type: "error", message: "Could not log out" });
      }

      // Optionally, clear the cookie
      res.clearCookie("auth_token"); // This is the default cookie name for express-session
      res.clearCookie("dfaut-0910"); // This is the default cookie name for express-session

      // Return a success message
      res
        .status(200)
        .json({ type: "success", message: "Logged out successfully" });
    });
  } catch (error) {
    return res
      .status(500)
      .json({ type: "error", message: "Internal server error" });
  }
};
