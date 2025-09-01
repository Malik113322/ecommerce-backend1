import ProductModel from "../models/ProductModel.js";
import { v2 as cloudinary } from "cloudinary";
import slugify from "slugify";
import categoryModel from "../models/categoryModel.js";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.configDotenv();

// payment stripe
const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);


// create-product
// for image upload
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME_CLOUDINARY,
  api_key: process.env.PUBLIC_KEY_CLOUDINARY,
  api_secret: process.env.PRIVATE_KEY_CLOUDINARY,
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
      qty:1
    });
    await product.save();
   
     res.status(201).send({
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
      res.status(200).send({
      success: true,
      message: "successfully get products",
      total: products.length,
      products,
    });
  } catch (error) {
    console.log(error);
      res.status(404).send({
      success: false,
      message: "products not found",
    });
  }
};

// get-single-product
export const getSingleProductController = async (req, res) => {
  try {
    const product = await ProductModel.find({ slug: req.params.slug });
      res.status(200).send({
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

      res.status(200).send({
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
      res.status(201).send({
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

      res.status(200).send({
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
      res.status(200).send({
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
      res.status(200).send({
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

      res.status(200).send({
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

      res.status(200).send(products);
  } catch (error) {
    console.log(error);
  }
};

// get category base products

export const categoryProductController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    const product = await ProductModel.find({ category }).populate("category");

      res.status(200).send({
      product,
      category,
    });
  } catch (error) {
    console.log(error);
  }
};


export const stripePaymentController = async(req, res)=>{
  try {
    const {products} = req.body;
    const lineItems = products.map((p)=>({
      price_data:{
        currency:"usd",
        product_data:{
          name:p.name
        },
        unit_amount:p.price*100
      },
      quantity: p.qty
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types:['card'],
      line_items:lineItems,
      mode:'payment',
      success_url:`${process.env.SUCCESS_URL}/success`,
      cancel_url:`${process.env.CANCLE_URL}/cancle`
    })
    res.json({
      id:session.id
    })

  } catch (error) {
    console.log(error)
  }
}
