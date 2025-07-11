import express from "express";
import {
  categoryProductController,
  createProductController,
  deleteProductController,
  getProductController,
  getSingleProductController,
  productCountController,
  productFilterController,
  productListController,
  productSearchController,
  similarProductController,
  updateProductController,
} from "../controllers/productController.js";

import {isAdmin, requireSign} from "../middleware/authMiddleware.js";

// router object
const router = express.Router();

// router || POST
// creating a product
router.post("/create-product",requireSign, isAdmin, createProductController);

// get products || GET
router.get("/get-products", getProductController);

// get-single-product || GET
router.get("/single-product/:slug", getSingleProductController);

// update product  || PUT
router.put("/update-product/:id", updateProductController);

// delete-product || DELETE
router.delete("/delete-product/:id", deleteProductController);

// filter products || POST
router.post("/filter-products", productFilterController);

// total product count || GET
router.get("/product-count", productCountController);

// product list based on page
router.get("/product-list/:page", productListController);

// products find based on keyword search
router.get("/search/:keyword", productSearchController);

// similar products  || GET
router.get("/similar-products/:pid/:cid", similarProductController);

// category base products || GET

router.get("/category-product/:slug", categoryProductController);

// payment routes

export default router;
