
import connectDB from "./database/db.js";
import dotenv from "dotenv";

dotenv.config({
    path: './env'
});
connectDB();