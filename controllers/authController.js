import { comperePassword, hashPassword } from "../helper/authHelper.js";
import userModel from "../models/userModel.js";
import JWT from "jsonwebtoken";

export const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, address, answer } = req.body;

    // validation

    if (!name) {
      return res.send({ error: "error in name" });

    }
    if (!email) {
      return res.send({ error: "error in email" });

    }
    if (!password) {
      return res.send({ error: "error in password" });

    }
    if (!phone) {
      return res.send({ error: "error in phone" });

    }
    if (!address) {
      return res.send({ error: "error in address" });

    }
    if (!answer) {
      return res.send({ error: "error in answer" });

    }

    // check user
    const exisitingUser = await userModel.findOne({ email });

    if (exisitingUser) {
      res.status(201).send({
        success: true,
        message: "Allready registered!",
      });
      return;
    }

    // hasingPassword
    const hashedPassword = await hashPassword(password);

    // save
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      address,
      answer,
    }).save();

    res.status(201).send({
      success: true,
      message: "successfully register!",
      user,
    });
    return;
  } catch (error) {
    res.status(404).send({
      success: false,
      message: "error in registration",
    });
    return;
  }
};

//login

export const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "email or password wrong",
      });
    }

    //check user
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(404).send({
        success: false,
        message: "email id not registered",
      });
      return;
    }

    //match password

    const match = await comperePassword(password, user.password);

    if (!match) {
      res.status(404).send({
        success: false,
        message: "password invalid",
      });
      return;
    }

    //token

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(201).send({
      success: true,
      message: "successfully login",
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        answer: user.answer,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({
      success: false,
      message: "error in login!",
    });
    return;
  }
};

// test
export const testController = async (req, res) => {
  res.send("protected route!");
  return;
};

// forget password controller

export const forgetPasswordController = async (req, res) => {
  try {
    const { email, answer, newPassword } = req.body;

    //validation
    if (!email) {
      return res.send({ message: "error in email" });

    }
    if (!answer) {
      return res.send({ message: "error in answer" });
    }
    if (!newPassword) {
      return res.send({ message: "error in newPassword" });
    }

    //check
    const user = await userModel.findOne({ email, answer });
    if (!user) {
      return res.status(400).send({
        success: false,
        message: "wrong email or answer",
      });

    }

    // new password hashing
    const hashed = await hashPassword(newPassword);
    await userModel.findByIdAndUpdate(user._id, { password: hashed });
    res.status(201).send({
      success: true,
      message: "successfully reset password",
    });
    return;
  } catch (error) {
    console.log(error);
    res.status(404).send({
      success: false,
      message: "error in forget password",
    });
    return;
  }
};

// update user details 
export const updateUserDetailsController = async (req, res) => {
  try {
    const { name, email, password, address } = req.body;
    const user = await userModel.findById(req.user._id);
    const hashedPassword = password ? await hashPassword(password) : undefined;
    const updateUser = await userModel.findByIdAndUpdate(req.user._id,
      {
        name: name || user.name,
        email: email || user.email,
        password: hashedPassword || user.password,
        address: address || user.address
      }, { new: true });

    res.status(201).send({
      success: true,
      message: "successfully update",
      updateUser
    });
  } catch (error) {
    console.log(error)
  }
}