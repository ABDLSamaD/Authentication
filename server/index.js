const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const { rateLimit } = require("express-rate-limit");
const connection = require("./src/models/connection");
const routes = require("./src/routes/routes");
const bodyParser = require("body-parser");

// configuration
const app = express();
app.use(cookieParser());
dotenv.config(); // dotenv
connection(); // database
app.use(bodyParser.json());

// cors config
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEN_URL,
  })
);

// config limiter
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 200 requests per `window` (here, per 5 minutes).
  standardHeaders: "draft-7", // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  message: "Too many requests, please try again after 5 minutes.",
});
app.use(limiter);

// session config
const sessionConfig = session({
  name: "dfaut-0910",
  resave: false,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET, // A common session secret for both user and admin
  // proxy: true,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Set to true in production with HTTPS
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: "sessions", // Common session collection
    autoRemove: "native",
  }),
});
app.use(session(sessionConfig));

// app.set("trust proxy", 1); // Trust the first proxy (for Vercel, Cloudflare, etc.)

// routes listen
app.use("/api/auth", routes);
app.get("/", (req, res) => {
  res.send("Welcome Authentication");
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON payload" });
  }
  next(err);
});
// Default catch-all route for Vercel
app.all("*", (req, res) => {
  res.status(404).send("Not Found");
});

app.listen(process.env.PORT || 4300, () => {
  console.log(`Server Listenning at port-${process.env.PORT}`);
});
