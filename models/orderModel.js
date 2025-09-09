import mongoose from "mongoose";

const orderModelSchema = new mongoose.Schema({
  products: [
    {
      type: mongoose.ObjectId,
      ref: "products",
    },
  ],
  payment: {}, // store stripe payment/session details
  buyer: {
    type: mongoose.ObjectId,
    ref: "users",
  },
  status: {
    type: String,
    default: "Not Process",
    enum: ["Not Process", "Processing", "Delivered", "Shipped", "Cancel"],
  },
}, {timestamps: true});

export default mongoose.model("Orders", orderModelSchema);
