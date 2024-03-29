import { asyncHandler } from "../utills/asyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utills/cloudinary.js";
import  jwt  from "jsonwebtoken";
const generateAccessAndRfreshToken = async(userId) => {
       
    const user = await User.findById(userId);
    if (!user) {
        // Handle the case where the user is not found
        return null; // Or throw an error, depending on your requirements
    }
    
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    // Update the refresh token in the user object
    user.refreshToken = refreshToken;
    
    // Save the updated user object in the database
    try {
        await user.save();
    } catch (error) {
        // Handle errors that occur during saving, such as validation errors
        console.error("Error saving user:", error);
        throw error; // Rethrow or handle as appropriate
    }
    
    // Return both tokens
    return { accessToken, refreshToken };
    


    // try {
    //     const user = await User.findById(userId)
    //     const accessToken = user.generateAccessToken()
    //     const refreshToken = user.generateRefreshToken()
        
    //     user.refreshToken = refreshToken
    //     await user.save({ validateBeforeSave: false })
    //    return {accessToken, refreshToken}
    // } catch (error) {
    //     throw new ApiError(500, "Something went wrong while generating refresh and access token")
    // }
}



const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullname, password } = req.body;

    if ([fullname, email, password, username].some((field) => field?.trim() === "")) {
        throw new ApiError(400,"All fields are requirded!!!!!!!!!")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })  
    if(existedUser){
        throw new ApiError(409,"Email or username already exists!!!!!!!!")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

     let coverImageLocalPath;
     if( req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
     }

    if(!avatarLocalPath){
        throw new ApiError(400,"avatar image is required!!!!!!!!!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400,"avatar image is required!!!!!!!!!")
    }

   const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser) {
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser, "User registered")
    )
})

const loginUser = asyncHandler(async (req,res) => {
    const {email,username,password} = req.body;
    if(!email && !username){
        throw new ApiError(400,"user or email required!!!!!!!!!!")
    }

    const user = await User.findOne({
        $or :[{username}, {email}]
    })

    if(!user) {
        throw new ApiError(409,"user does not exit!!!!!!!!!")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401,"Password is not valid!!!!!!!!!!!!!!!")
    }  

      const {accessToken,refreshToken} = await generateAccessAndRfreshToken(user._id)

      const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

      const options = {
        httpOnly: true,
        secure: true
      }


      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "User logggeed in successfullyyy!!"
        )
      )
})

const logoutUser = asyncHandler(async(req,res) => {
     User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
     )
     const options = {
        httpOnly: true,
        secure: true
      }

      return res
      .status(200)
      .clearCookie("accessToken",options)
      .clearCookie("refreshToken",options)
      .json( new ApiResponse(200, {} , "User logged Out"))

})


const refreshAccessToken = asyncHandler(async ( req,res) => {
    const incomRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(incomRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
       const user = await User.findById(decodedToken?._id)
    
       if(!user){
        throw new ApiError(401,"Invalid refresh token")
       }
    
       if(incomRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")
       }
    
       const options = {
        httpOnly: true,
        secure: true
       }
    
    
       const {accessToken,newRefreshToken} = await generateAccessAndRfreshToken(user._id)
    
       return res
       .status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken",newRefreshToken,options)
       .json(
         new ApiResponse(
            200,
            {accessToken,refreshToken: newRefreshToken},
            "Access token refreshed"
         )
       )
    
    } catch (error) {
        throw new ApiError(401,error?.message  || "Invalid refresh token")
    }


})
export { registerUser,loginUser,logoutUser,refreshAccessToken}