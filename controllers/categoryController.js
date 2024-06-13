import categoryModel from "../models/categoryModel.js";
import slugify from "slugify";

//create category

export const createCategoryController = async (req, res) => {
  try {
    const { name } = req.body;

    // validation
    if (!name) {
      return res.send({ message: "name is required!" });
    }

    // check category
    const categoryCheck = await categoryModel.findOne({ name });
    if (categoryCheck) {
      return res.status(200).send({
        successfull: true,
        message: "category allready exisits",
      });
    }

    const category = await new categoryModel({
      name,
      slug: slugify(name),
    }).save();
    return res.status(201).send({
      success: true,
      message: "successfully created!",
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).send({
      success: false,
      message: "Error in creating category!",
      error,
    });
  }
};

// update category

export const updateCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await categoryModel.findByIdAndUpdate(
      id,
      { name, slug: slugify(name) },
      { new: true }
    );

    return res.status(201).send({
      success: true,
      message: "successfully updated!",
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(404).send({
      success: false,
      message: "category not updated!",
      error,
    });
  }
};

//get all category
export const getAllCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.find({});
    return res.status(200).send({
      success: true,
      message: "successfull getting all categories!",
      category,
    });
  } catch (error) {
    return res.status(404).send({
      success: false,
      message: "Error while getting categories!",
      error,
    });
  }
};

// get sigle category

export const getSingleCategoryController = async (req, res) => {
  try {
    const category = await categoryModel.findOne({ slug: req.params.slug });
    return res.status(200).send({
      success: true,
      message: "successfully getted single category!",
      category,
    });
  } catch (error) {
    return res.status(404).send({
      success: true,
      message: "Error in getting single category!",
      error,
    });
  }
};

// delete category

export const deleteCategoryController = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await categoryModel.findByIdAndDelete(id);

    res.status(200).send({
      success: "true",
      message: "successfully deleted",
      category,
    });
  } catch (error) {
    return res.status(404).send({
      success: false,
      message: "Error in delete category",
      error,
    });
  }
};
