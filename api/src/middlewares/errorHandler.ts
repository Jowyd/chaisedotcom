import { Request, Response, NextFunction } from "express";

interface Error {
  status?: number;
  message?: string;
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("An error occurred:", err);

  const statusCode = err.status || 500;

  if (statusCode === 400 && "fields" in err) {
    for (let key in err.fields as string[]) {
      let request: any = (err.fields as any[])[key];
      if ("message" in request && "value" in request) {
        err.message =
          key.replace("requestBody.", "") +
          " " +
          request.value +
          " " +
          request.message;
      }
    }
  }

  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    status: statusCode,
    message: message,
  });
};

export default errorHandler;
