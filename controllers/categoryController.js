import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";
import { STATUS_CODES, MESSAGES } from "../constants/index.js";

// ======================== CREATE CATEGORY ========================
export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    // Validation
    if (!name) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.CATEGORY.NAME_REQUIRED,
      });
    }

    // Check if category already exists
    const categoryExists = await categoryModel.findOne({ name });
    if (categoryExists) {
      return res.status(STATUS_CODES.CONFLICT).json({
        success: false,
        message: MESSAGES.CATEGORY.ALREADY_EXISTS,
      });
    }

    // Create category
    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();

    res.status(STATUS_CODES.CREATED).json({
      success: true,
      message: MESSAGES.CATEGORY.CREATED_SUCCESS,
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.CATEGORY.CREATE_ERROR,
      error,
    });
  }
};

// ======================== UPDATE CATEGORY ========================
export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({
        success: false,
        message: MESSAGES.CATEGORY.NAME_REQUIRED,
      });
    }

    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );

    if (!category) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.CATEGORY.NOT_FOUND,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.CATEGORY.UPDATED_SUCCESS,
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.CATEGORY.UPDATE_ERROR,
      error,
    });
  }
};

// ======================== GET ALL CATEGORIES ========================
export const getAllCategoryController = async (req, res) => {
  try {
    const categories = await categoryModel.find({});

    if (!categories || categories.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.CATEGORY.NO_CATEGORIES_FOUND,
      });
    }

    return res.status(STATUS_CODES.OK).json({
      success: true,
      categories,
    });
  } catch (error) {
    return res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message,
    });
  }
};

// ======================== GET SINGLE CATEGORY ========================
export const getSingleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });

    if (!category) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.CATEGORY.NOT_FOUND,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.CATEGORY.RETRIEVED_SUCCESS,
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.CATEGORY.FETCH_ERROR,
      error,
    });
  }
};

// ======================== DELETE CATEGORY ========================
export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findByIdAndDelete(id);

    if (!category) {
      return res.status(STATUS_CODES.NOT_FOUND).json({
        success: false,
        message: MESSAGES.CATEGORY.NOT_FOUND,
      });
    }

    res.status(STATUS_CODES.OK).json({
      success: true,
      message: MESSAGES.CATEGORY.DELETED_SUCCESS,
      category,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: MESSAGES.CATEGORY.DELETE_ERROR,
      error,
    });
  }
};
