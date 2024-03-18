import {v2 as cloudinary} from 'cloudinary';

import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null
        const response = await cloudinary.uploader.upload(localFilePath, {
              resource_type: "auto"
        })
        fs.unlinkSync(localFilePath)
        return response;
    } catch(error) {
       fs.unlinkSync(localFilePath)
       return null
    }
}


export {uploadOnCloudinary}

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); }); 