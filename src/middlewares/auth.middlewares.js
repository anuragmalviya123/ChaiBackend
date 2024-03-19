import { ApiError } from "../utills/ApiError.js";
import { asyncHandler } from "../utills/asyncHandler.js";
import  jwt  from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req,res,next) =>{
    try {
        // Extract the access token from the request
        const token = req.cookies.accessToken || (req.headers.authorization || '').replace("Bearer ", "");
    
        // Check if the token exists
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
    
        // Verify the access token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
        // Find the user associated with the decoded token
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
    
        // Check if the user exists
        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }
    
        // Attach the user object to the request for further processing
        req.user = user;
    
        // Call the next middleware
        next();
    } catch (error) {
        // If any errors occur during token verification or user retrieval, throw an API error
        throw new ApiError(401, error?.message || "Invalid access token");
    }
    




//    try {
//      const token = req.cookie?.accessToken || req.header ("Authorization")?.replace("Bearer ","")
 
//      if (!token) {
//          throw new ApiError(401,"Unauthorized request")
//      }
//      const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
     
//      const user = await User.findById(decodedToken?._id).select("-password - refreshToken")
 
//      if(!user)
//      {
//          throw new ApiError(401,"Invalid Access Token")
//      }
 
//      req.user = user;
//      next();
//    } catch (error) {
//       throw new ApiError(401, error?.message || "Invalid access token")
//    }
})