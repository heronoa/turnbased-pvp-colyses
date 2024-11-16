import rateLimit from "express-rate-limit";

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1,
  message:
    "Too many login attempts from this IP, please try again after 15 minutes",
  headers: true,
});

export default loginRateLimiter;
