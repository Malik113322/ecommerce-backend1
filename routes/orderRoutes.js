
import expres from "express";
import { createOrderController, getOrdersController } from "../controllers/orderController.js";


const router = expres.Router();

router.post('/create-order', createOrderController);
router.get("/my-orders/:buyerId", getOrdersController);

export default router;