import mongoose from "mongoose";

const connectDB = async () =>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`{successfully connected to mongodb${conn.connection.host}}`.bgCyan)
    } catch (error) {
        
    }
};

export default connectDB;