import Orders from "../models/orderModel.js";

export const createOrderController = async (req, res) => {
  try {
    const { products, payment, buyerId } = req.body;

    const order = new Orders({
      products,
      payment,
      buyer: buyerId,
    });

    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error("Order Create Error:", error);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

export const getOrdersController = async (req, res) => {
  try {
    const { buyerId } = req.params;

    const orders = await Orders.find({ buyer: buyerId })
      .populate("products")
      .populate("buyer", "name email");

    res.json({ success: true, orders });
  } catch (error) {
    console.error("Get Orders Error:", error);
    res.status(500).json({ success: false, message: "Fetching orders failed" });
  }
};
