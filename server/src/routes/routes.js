const express = require("express");
const routes = express.Router();
const {
  signup,
  verifyOtp,
  signin,
  logout,
} = require("../controller/userController");
const sessionAuth = require("../middleware/sessionAuth");

routes.post("/signup", signup);
routes.post("/verifyotp", verifyOtp);
routes.post("/signin", signin);
routes.post("/logout", sessionAuth, logout);

module.exports = routes;
