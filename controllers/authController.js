import { comparePassword, hashPassword } from "../helper/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";
import validator from "validator";
import { STATUS_CODES, MESSAGES } from "../constants/index.js";

// ======================== REGISTER USER ========================
export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    // Validation
    if (!name || !email || !password || !phone || !address || !answer) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.AUTH.ALL_FIELDS_REQUIRED,
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_EMAIL,
      });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(STATUS_CODES.CONFLICT).json({
        success: false,
        message: MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED,
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Save user
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      answer,
    }).save();

    return res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: MESSAGES.AUTH.USER_REGISTERED_SUCCESS,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.REGISTRATION_ERROR,
    });
  }
};

// ======================== LOGIN ========================
export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.AUTH.EMAIL_PASSWORD_REQUIRED,
      });
    }

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.AUTH.EMAIL_NOT_REGISTERED,
      });
    }

    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(STATUS_CODES.UNAUTHORIZED).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_PASSWORD,
      });
    }

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        answer: user.answer,
        role: user.role,
        _id: user._id,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.LOGIN_ERROR,
    });
  }
};

// ======================== TEST ========================
export const testController = async (req, res) => {
  res.status(STATUS_CODES.OK).send(MESSAGES.AUTH.PROTECTED_ROUTE);
};

// ======================== FORGET PASSWORD ========================
export const forgetPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    // Validation
    if (!email || !answer || !newPassword) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.AUTH.ALL_FIELDS_REQUIRED,
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.AUTH.INVALID_EMAIL,
      });
    }

    // Check user
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.AUTH.WRONG_EMAIL_OR_ANSWER,
      });
    }

    // Hash new password
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.AUTH.PASSWORD_RESET_SUCCESS,
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.FORGET_PASSWORD_ERROR,
    });
  }
};

// ======================== UPDATE USER DETAILS ========================
export const updateUserDetailsController = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.AUTH.USER_NOT_FOUND,
      });
    }

    // Hash password if provided
    const hashedPassword = password ? await hashPassword(password) : undefined;

    // Update user
    const updatedUser = await userModel.findByIdAndUpdate(
      req.user._id,
      {
        name: name || user.name,
        email: email || user.email,
        password: hashedPassword || user.password,
        address: address || user.address,
      },
      { new: true }
    );

    return res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.AUTH.USER_UPDATE_SUCCESS,
      updatedUser,
    });
  } catch (error) {
    console.error(error);
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.AUTH.USER_UPDATE_ERROR,
    });
  }
};
