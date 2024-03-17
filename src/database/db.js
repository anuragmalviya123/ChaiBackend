import mongoose from "mongoose";
import { DB_NAME } from "../constent.js";


const connectDB = async () => {
    try {
        const connectionInstence = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDb Connected Succesfully ${connectionInstence.connection.host}`)
    } catch (error) {
        console.log("MONGODB CONNECTION ERROR", error);
        process.exit(1);
    }
}

export default connectDB;