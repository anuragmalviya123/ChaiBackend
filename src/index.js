
import connectDB from "./database/db.js";
import dotenv from "dotenv";
import {app} from "./app.js"
dotenv.config({
    path: './env'
});


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000 ,(req,res) => {
      console.log(`Server running at port ${process.env.PORT}`);
    })
})
.catch((err) => {
   console.log("MONGODB CONNECTION ERROR",err)
})
