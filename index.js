import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import morgan from "morgan";
import cors from "cors";
import authRoute from "./routes/authRoute.js";
import categoryRoute from "./routes/categoryRoute.js";
import productRoutes from "./routes/productRoutes.js";
import fileupload from "express-fileupload";



// configure env
dotenv.config();
// rest object
const app = express();
app.use(cors());

// database config
connectDB();

// middlewares
app.use(fileupload({
  useTempFiles: true
}));

app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/category", categoryRoute);
app.use("/api/v1/product", productRoutes);

app.get("/", (req, res)=>{
  res.json({message:"working"})
})


//port
const PORT = 8080;


// run listen
app.listen(PORT, () => {
  console.log(`working on ${PORT}`.bgMagenta);
});
