import { asyncHandler } from "../utills/asyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utills/cloudinary.js";
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


export { registerUser }