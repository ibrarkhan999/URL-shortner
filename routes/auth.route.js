import { Router } from "express";
import { getLogout,getLogin, getRegister, postLogin, postRegister } from "../controller/auth.controller.js";

const router = Router()

router.get("/login",getLogin)
router.post("/login",postLogin)



router.get("/register",getRegister)
router.post("/register",postRegister)



router.get("/logout",getLogout)





export const authRouter = router