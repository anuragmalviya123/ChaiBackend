import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js"
import { loginUser } from "../controllers/login.controller.js";
import { serviceUser } from "../controllers/service.controller.js";
import {upload} from "../middlewares/multer.middlewares.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        {
           name: "avatar",
           maxCount: 1
        },
        {
          name:"coverImage",
          maxCount: 1
        }
    ])
    ,registerUser)
router.route("/login").post(loginUser)  
router.route("/service").post(serviceUser)

export default router