import JWT from "jsonwebtoken";
import userModel from "../models/userModel.js";

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
    res.status(404).send({
      success: true,
      message: "unauthorized access",
    });
  }
};

// admin auth
export const isAdmin = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user._id);
    if (user.role !== 1) {
      res.status(404).send({
        success: false,
        message: "unAuthorized Access only admin allowed",
      });
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};
