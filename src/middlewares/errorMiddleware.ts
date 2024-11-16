import { Request, Response, NextFunction } from "express";

interface HttpError extends Error {
  status?: number;
  details?: any;
  errors?: any;
}

const errorHandler = (
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.status) {
    return res.status(err.status).json({
      message: err.message || "An unexpected error occurred.",
      details: err.details || null,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      details: err.errors || null,
    });
  }

  console.error(err);

  return res.status(500).json({
    message: "Internal Server Error",
    details: err.message || null,
  });
};

export default errorHandler;
