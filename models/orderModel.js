import mongoose from "mongoose";

const orderModelSchema = new mongoose.Schema({
    products:[
        {
            type: mongoose.ObjectId,
            ref: "products"
        }
    ],
    payment:{},
    buyer:{
        type: mongoose.ObjectId,
        ref: "users"
    },
    status:{
        type: String,
        default: "Not Process",
        enum: ["Not Process, Processing, Devliverd, Shipped, Cancel"]
    }
});

export default mongoose.model("Orders", orderModelSchema);