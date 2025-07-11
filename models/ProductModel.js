import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String
    },
    slug: {
      type: String,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      // ref: "category",
    },

    quantity: {
      type: Number,
      required: true,
    },
    shipping: {
      type: Boolean,
    },
    qty:{
      type:Number
    }
  },
  { timestamps: true }
);

export default mongoose.model("products", productSchema);
