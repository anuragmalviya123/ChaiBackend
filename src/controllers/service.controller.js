import { asyncHandler } from  "../utills/asyncHandler.js";


const serviceUser = asyncHandler( async(req,res) => {
        res.status(200).json({
        message: "Bhai service karne lage"
    })
})


export {serviceUser}