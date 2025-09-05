import ProductModel from "../models/ProductModel.js";
import { v2 as cloudinary } from "cloudinary";
import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config(); // Fixed dotenv usage

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
  api_key: process.env.PUBLIC_KEY_CLOUDINARY,
  api_secret: process.env.PRIVATE_KEY_CLOUDINARY,
});

// CREATE PRODUCT
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.body;

    if (!req.files || !req.files.image) {
      return res.status(400).json({ success: false, message: "Image is required" });
    }

    const file = req.files.image;

    const result = await cloudinary.uploader.upload(file.tempFilePath);

    const product = new ProductModel({
      name,
      image: result.secure_url,
      slug: slugify(name),
      description,
      price,
      category,
      quantity,
      shipping,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error creating product" });
  }
};

// GET ALL PRODUCTS
export const getProductController = async (req, res) => {
  try {
    const products = await ProductModel.find({})
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      total: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching products" });
  }
};

// GET SINGLE PRODUCT
export const getSingleProductController = async (req, res) => {
  try {
    const product = await ProductModel.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching product" });
  }
};

// UPDATE PRODUCT
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, quantity, shipping, category } = req.body;
    const { id } = req.params;

    const product = await ProductModel.findByIdAndUpdate(
      id,
      { name, description, price, quantity, shipping, category },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating product" });
  }
};

// DELETE PRODUCT
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
};

// FILTER PRODUCTS
export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    const args = {};

    if (checked && checked.length > 0) args.category = checked;
    if (radio && radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await ProductModel.find(args);

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error filtering products" });
  }
};

// PRODUCT COUNT
export const productCountController = async (req, res) => {
  try {
    const total = await ProductModel.estimatedDocumentCount();

    res.status(200).json({ success: true, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error counting products" });
  }
};

// PRODUCT LIST PER PAGE
export const productListController = async (req, res) => {
  try {
    const perPage = 8;
    const page = req.params.page ? parseInt(req.params.page) : 1;

    const products = await ProductModel.find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error listing products" });
  }
};

// SEARCH PRODUCTS
export const productSearchController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await ProductModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });

    res.status(200).json({ success: true, results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error searching products" });
  }
};

// SIMILAR PRODUCTS
export const similarProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;

    const products = await ProductModel.find({
      category: cid,
      _id: { $ne: pid },
    })
      .populate("category")
      .limit(2);

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching similar products" });
  }
};

// CATEGORY BASED PRODUCTS
export const categoryProductController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const products = await ProductModel.find({ category }).populate("category");

    res.status(200).json({ success: true, category, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching category products" });
  }
};

// STRIPE PAYMENT
export const stripePaymentController = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !products.length) {
      return res.status(400).json({ success: false, message: "No products provided" });
    }

    const lineItems = products.map((p) => ({
      price_data: {
        currency: "usd",
        product_data: { name: p.name },
        unit_amount: p.price * 100,
      },
      quantity: p.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.SUCCESS_URL}/success`,
      cancel_url: `${process.env.CANCEL_URL}/cancel`,
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Stripe payment error" });
  }
};
