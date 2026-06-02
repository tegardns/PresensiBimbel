import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token = "";
    const header = req.headers.authorization;

    if (header) {
      token = header.split(" ")[1];
    } else if (req.query.token) {
      token = req.query.token as string;
    }

    if (!token) {
      return res.status(401).json({
        message: "Token tidak ada",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token tidak valid",
    });
  }
};
