import express from "express";
import {
  createCategoryController,
  deleteCategoryController,
  getAllCategoryController,
  getSingleCategoryController,
  updateCategoryController,
} from "../controllers/categoryController.js";
import { isAdmin, requireSign } from "../middleware/authMiddleware.js";

// router object
const router = express.Router();

// routing

// create category || POST
router.post("/create-category", requireSign, isAdmin, createCategoryController);

// update category // || PUT
router.put(
  "/update-category/:id",
  requireSign,
  isAdmin,
  updateCategoryController
);

//get-all category || GET
router.get("/categories", getAllCategoryController);

//get single || GET
router.get("/single-category/:slug", getSingleCategoryController);

// delete category

router.delete(
  "/delete-category/:id",
  requireSign,
  isAdmin,
  deleteCategoryController
);

export default router;
