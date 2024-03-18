import { asyncHandler } from  "../utills/asyncHandler.js";


const loginUser = asyncHandler( async(req,res) => {
        res.status(200).json({
        message: "Bhai login ho gaye"
    })
})


export {loginUser}