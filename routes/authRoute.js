import express from "express";
import {
  forgetPasswordController,
  loginController,
  registerController,
  testController,
  updateUserDetailsController,
  // updateDetailsController,
} from "../controllers/authController.js";
import { isAdmin, requireSign } from "../middleware/authMiddleware.js";

import { STATUS_CODES } from "../constants/index.js";

// router object
const router = express.Router();

// routing

// registeration || post

router.post("/register", registerController);

// login || post

router.post("/login", loginController);

// test

router.get("/test", requireSign, isAdmin, testController);

// protected route for user
router.get("/user-auth", requireSign, (req, res) => {
  res.status(STATUS_CODES.OK).send({ ok: true });
});

// protected route for admin
router.get("/admin-auth", requireSign, isAdmin, (req, res) => {
  res.status(STATUS_CODES.OK).send({ ok: true });
});

// reset password 
router.post("/forget-password", forgetPasswordController);

// update user details 
router.put("/update-details", requireSign, updateUserDetailsController);



export default router;
