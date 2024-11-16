import rateLimit from "express-rate-limit";

const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error:
      "Too many login attempts from this IP, please try again after 15 minutes",
  },
  headers: true,
});

export default loginRateLimiter;
