import ProductModel from "../models/ProductModel.js";
import { v2 as cloudinary } from "cloudinary";
import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";
import braintree from "braintree";
import dotenv from "dotenv";
import orderModel from "../models/orderModel.js";

dotenv.configDotenv();

// paymet getway braintree

var gateway = new braintree.BraintreeGateway({
  environment: braintree.Environment.Sandbox,
  merchantId: process.env.MERCHANT_ID,
  publicKey: process.env.PUBLIC_KEY,
  privateKey: process.env.PRIVET_KEY,
});

// create-product
// for image upload
cloudinary.config({
  cloud_name: "dzg8wohnb",
  api_key: "524223246331484",
  api_secret: "YzzDJCEUjauFXhS-kiYRyD2wLw0",
});

export const createProductController = async (req, res) => {
 try {
  const { name, description, price, category, quantity, shipping } = req.body;
  const file = req.files.image;
  cloudinary.uploader.upload(file.tempFilePath, async (err, result) => {
    const product = new ProductModel({
      name,
      image: result.url,
      slug: slugify(name),
      description,
      price,
      category,
      quantity,
      shipping,
    });
    await product.save();
    return res.status(201).send({
      success: "true",
      message: "successfully created",
      product,
    });
  });
 } catch (error) {
  console.log(error);
 }
};

// get products
export const getProductController = async (req, res) => {
  try {
    const products = await ProductModel.find({})
      .populate("category")
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      message: "successfully get products",
      total: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).send({
      success: false,
      message: "products not found",
    });
  }
};

// get-single-product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await ProductModel.find({ slug: req.params.slug });
    return res.status(200).send({
      success: true,
      message: "successfully get single product",
      product,
    });
  } catch (error) {
    console.log(error);
  }
};

// update product
export const updateProductController = async (req, res) => {
  try {
    const { name, description, price, quantity, shipping, category } = req.body;
    const { id } = req.params;
    const product = await ProductModel.findByIdAndUpdate(
      id,
      {
        name,
        description,
        price,
        quantity,
        shipping,
        category,
      },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: "successfully update",
      product,
    });
  } catch (error) {
    console.log(error);
  }
};

// delete prouduct
export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ProductModel.findByIdAndDelete(id);
    return res.status(201).send({
      success: true,
      message: "successfully deleted",
      product,
    });
  } catch (error) {
    console.log(error);
    res.status(404).send({
      success: false,
      message: "not deleted",
    });
  }
};

// filter products

export const productFilterController = async (req, res) => {
  try {
    const { checked, radio } = req.body;
    const args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await ProductModel.find(args);

    return res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

// count product for loadmore
export const productCountController = async (req, res) => {
  try {
    const total = await ProductModel.find({}).estimatedDocumentCount();
    return res.status(200).send({
      success: true,
      total,
    });
  } catch (error) {
    console.log(error);
  }
};

// product list 8 product per page
export const productListController = async (req, res) => {
  try {
    const perPage = 8;
    const page = req.params.page ? req.params.page : 1;
    const products = await ProductModel.find({})
      .skip((page - 1) * perPage)
      .limit(perPage)
      .sort({ createdAt: -1 });
    return res.status(200).send({
      success: true,
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

// products search based on keyword

export const productSearchController = async (req, res) => {
  try {
    const { keyword } = req.params;
    const results = await ProductModel.find({
      $or: [
        { name: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ],
    });

    return res.status(200).send({
      success: true,
      results,
    });
  } catch (error) {
    console.log(error);
  }
};

// similar product
export const similarProductController = async (req, res) => {
  try {
    const { pid, cid } = req.params;
    const products = await ProductModel.find({
      category: cid,
      _id: { $ne: pid },
    })
      .populate("category")
      .limit(2);

    return res.status(200).send(products);
  } catch (error) {
    console.log(error);
  }
};

// get category base products

export const categoryProductController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const product = await ProductModel.find({ category }).populate("category");

    return res.status(200).send({
      product,
      category,
    });
  } catch (error) {
    console.log(error);
  }
};

//payment controller


export const braintreeTokenController = (req, res) => {
  try {
    gateway.clientToken.generate({}, function (err, response) {
      if (err) {
        res.status(500).send(err);
      } else {
        res.send(response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export const braintreePaymentController = async(req, res) => {
  try {
    const { cart, nonce } = req.body;
    let total = 0;
    cart.map((item) => {
      total += item.price;
    });

    let newTransaction = gateway.transaction.sale(
      {
        amount: total,
        paymentMethodNonce: nonce,
        options: {
          submitForSettlement: true,
        },
      },
      function (error, result) {
        if (result) {
          const order = new orderModel({
            products: cart,
            payment: result,
            buyer: req.user._id,
          }).save();
          res.json({ ok: true });
        } else {
          res.status(500).send(error);
        }
      }
    );
  } catch (error) {
    console.log(error)
  }
};
