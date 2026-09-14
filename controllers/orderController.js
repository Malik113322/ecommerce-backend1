import Orders from "../models/orderModel.js";
import { STATUS_CODES, MESSAGES } from "../constants/index.js";

// ======================== CREATE ORDER ========================
export const createOrderController = async (req, res) => {
  try {
    const { products, payment, buyerId } = req.body;
    const order = new Orders({
      products,
      payment,
      buyer: buyerId,
    });

    await order.save();

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: MESSAGES.ORDER.CREATE_SUCCESS,
      order,
    });
  } catch (error) {
    console.error("Order Create Error:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ORDER.CREATE_ERROR,
    });
  }
};

// ======================== GET ORDERS ========================
export const getOrdersController = async (req, res) => {
  try {
    const { buyerId } = req.params;

    const orders = await Orders.find({ buyer: buyerId })
      .populate("products")
      .populate("buyer", "name email");

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.ORDER.FETCH_SUCCESS,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.ORDER.FETCH_ERROR,
    });
  }
};
