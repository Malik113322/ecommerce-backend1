import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";
import { STATUS_CODES, MESSAGES } from "../constants/index.js";

export const requireSign = async (req, res, next) => {
  try {
    const decode = JWT.verify(
      req.headers.authorization,
      process.env.JWT_SECRET
    );
    req.user = decode;
    next();
  } catch (error) {
    console.log(error);
    res.status(STATUS_CODES.UNAUTHORIZED).send({
      success: false,
      message: MESSAGES.AUTH.UNAUTHORIZED_ACCESS,
    });
  }
};

// admin auth
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (!user || user.role !== 1) {
      return res.status(STATUS_CODES.FORBIDDEN).send({
        success: false,
        message: MESSAGES.AUTH.ADMIN_ACCESS_ONLY,
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).send({
      success: false,
      message: MESSAGES.AUTH.UNAUTHORIZED_ACCESS,
    });
  }
};
