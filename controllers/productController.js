import ProductModel from "../models/ProductModel.js";
import { v2 as cloudinary } from "cloudinary";
import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";
import dotenv from "dotenv";
import Stripe from "stripe";
import { STATUS_CODES, MESSAGES } from "../constants/index.js";

dotenv.config();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
  api_key: process.env.PUBLIC_KEY_CLOUDINARY,
  api_secret: process.env.PRIVATE_KEY_CLOUDINARY,
});

// ======================== CREATE PRODUCT ========================
export const createProductController = async (req, res) => {
  try {
    const { name, description, price, category, quantity, shipping } = req.body;

    if (!req.files || !req.files.image) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.PRODUCT.IMAGE_REQUIRED,
      });
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

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: MESSAGES.PRODUCT.CREATED_SUCCESS,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.CREATE_ERROR,
    });
  }
};

// ======================== GET ALL PRODUCTS ========================
export const getProductController = async (req, res) => {
  try {
    const products = await ProductModel.find({})
      .populate("category")
      .sort({ createdAt: -1 });

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.PRODUCT.RETRIEVED_SUCCESS,
      total: products.length,
      products,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.FETCH_ERROR,
    });
  }
};

// ======================== GET SINGLE PRODUCT ========================
export const getSingleProductController = async (req, res) => {
  try {
    const product = await ProductModel.findOne({ slug: req.params.slug });

    if (!product) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PRODUCT.NOT_FOUND,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.PRODUCT.RETRIEVED_SUCCESS,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.FETCH_SINGLE_ERROR,
    });
  }
};

// ======================== UPDATE PRODUCT ========================
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
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PRODUCT.NOT_FOUND,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.PRODUCT.UPDATED_SUCCESS,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.UPDATE_ERROR,
    });
  }
};

// ======================== DELETE PRODUCT ========================
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.PRODUCT.NOT_FOUND,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.PRODUCT.DELETED_SUCCESS,
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.DELETE_ERROR,
    });
  }
};

// ======================== FILTER PRODUCTS ========================
export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    const args = {};

    if (checked && checked.length > 0) args.category = checked;
    if (radio && radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    const products = await ProductModel.find(args);

    res.status(STATUS_CODES.OK).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.FILTER_ERROR,
    });
  }
};

// ======================== PRODUCT COUNT ========================
export const productCountController = async (req, res) => {
  try {
    const total = await ProductModel.estimatedDocumentCount();

    res.status(STATUS_CODES.OK).json({ success: true, total });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.COUNT_ERROR,
    });
  }
};

// ======================== PRODUCT LIST PER PAGE ========================
export const productListController = async (req, res) => {
  try {
    const perPage = 8;
    const page = req.params.page ? parseInt(req.params.page) : 1;

    const products = await ProductModel.find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });

    res.status(STATUS_CODES.OK).json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.LIST_ERROR,
    });
  }
};

// ======================== SEARCH PRODUCTS ========================
export const productSearchController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await ProductModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });

    res.status(STATUS_CODES.OK).json({ success: true, results });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.SEARCH_ERROR,
    });
  }
};

// ======================== SIMILAR PRODUCTS ========================
export const similarProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;

    const products = await ProductModel.find({
      category: cid,
      _id: { $ne: pid },
    })
      .populate("category")
      .limit(2);

    res.status(STATUS_CODES.OK).json(products);
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.SIMILAR_FETCH_ERROR,
    });
  }
};

// ======================== CATEGORY BASED PRODUCTS ========================
export const categoryProductController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.CATEGORY.NOT_FOUND,
      });
    }

    const products = await ProductModel.find({ category }).populate("category");

    res.status(STATUS_CODES.OK).json({ success: true, category, products });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.CATEGORY_PRODUCTS_ERROR,
    });
  }
};

// ======================== STRIPE PAYMENT ========================
export const stripePaymentController = async (req, res) => {
  try {
    const { products } = req.body;

    if (!products || !products.length) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.PRODUCT.NO_PRODUCTS_PROVIDED,
      });
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

    res.status(STATUS_CODES.OK).json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.STRIPE_PAYMENT_ERROR,
    });
  }
};

// ======================== CHECK SESSION ========================
export const checkSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent", "line_items"],
    });

    res.status(STATUS_CODES.OK).json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Stripe Session Error:", error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.PRODUCT.SESSION_FETCH_FAILED,
    });
  }
};
