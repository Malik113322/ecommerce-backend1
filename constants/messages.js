export const MESSAGES = {
  // Auth & User Messages
  AUTH: {
    ALL_FIELDS_REQUIRED: "All fields are required",
    INVALID_EMAIL: "Please provide a valid email address",
    EMAIL_ALREADY_REGISTERED: "Email already registered",
    USER_REGISTERED_SUCCESS: "User registered successfully",
    REGISTRATION_ERROR: "Server error in registration",
    EMAIL_PASSWORD_REQUIRED: "Email and password are required",
    EMAIL_NOT_REGISTERED: "Email not registered",
    INVALID_PASSWORD: "Invalid password",
    LOGIN_SUCCESS: "Login successful",
    LOGIN_ERROR: "Server error in login",
    WRONG_EMAIL_OR_ANSWER: "Wrong email or answer",
    PASSWORD_RESET_SUCCESS: "Password reset successfully",
    FORGET_PASSWORD_ERROR: "Server error in forget password",
    USER_NOT_FOUND: "User not found",
    USER_UPDATE_SUCCESS: "User details updated successfully",
    USER_UPDATE_ERROR: "Server error in updating user",
    UNAUTHORIZED_ACCESS: "Unauthorized access",
    ADMIN_ACCESS_ONLY: "Unauthorized access, only admin allowed",
    PROTECTED_ROUTE: "Protected route!",
  },

  // Category Messages
  CATEGORY: {
    NAME_REQUIRED: "Name is required",
    ALREADY_EXISTS: "Category already exists",
    CREATED_SUCCESS: "Category created successfully",
    CREATE_ERROR: "Error creating category",
    NOT_FOUND: "Category not found",
    UPDATED_SUCCESS: "Category updated successfully",
    UPDATE_ERROR: "Error updating category",
    NO_CATEGORIES_FOUND: "No categories found",
    RETRIEVED_SUCCESS: "Category retrieved successfully",
    FETCH_ERROR: "Error fetching category",
    DELETED_SUCCESS: "Category deleted successfully",
    DELETE_ERROR: "Error deleting category",
  },

  // Product Messages
  PRODUCT: {
    IMAGE_REQUIRED: "Image is required",
    CREATED_SUCCESS: "Product created successfully",
    CREATE_ERROR: "Error creating product",
    RETRIEVED_SUCCESS: "Products retrieved successfully",
    FETCH_ERROR: "Error fetching products",
    NOT_FOUND: "Product not found",
    FETCH_SINGLE_ERROR: "Error fetching product",
    UPDATED_SUCCESS: "Product updated successfully",
    UPDATE_ERROR: "Error updating product",
    DELETED_SUCCESS: "Product deleted successfully",
    DELETE_ERROR: "Error deleting product",
    FILTER_ERROR: "Error filtering products",
    COUNT_ERROR: "Error counting products",
    LIST_ERROR: "Error listing products",
    SEARCH_ERROR: "Error searching products",
    SIMILAR_FETCH_ERROR: "Error fetching similar products",
    CATEGORY_PRODUCTS_ERROR: "Error fetching category products",
    NO_PRODUCTS_PROVIDED: "No products provided",
    STRIPE_PAYMENT_ERROR: "Stripe payment error",
    SESSION_FETCH_FAILED: "Failed to fetch session",
  },

  // Order Messages
  ORDER: {
    CREATE_SUCCESS: "Order created successfully",
    CREATE_ERROR: "Order creation failed",
    FETCH_SUCCESS: "Orders retrieved successfully",
    FETCH_ERROR: "Fetching orders failed",
  },
};

export default MESSAGES;
