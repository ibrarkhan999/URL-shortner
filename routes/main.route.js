import { Router } from "express";
import { changePassword, dynamicForgetPassword, EditProfile, forgetPassword, getIndex, getProfile, getVerifyEmailToken, newPassword, postChangePassword, postEditProfile, postForgetPassword, resendVerificationLink, verifyEmail } from "../controller/main.controller.js";


const router = Router()

router.get("/",getIndex)

router.get("/profile",getProfile)

router.get("/edit-profile/:slug",EditProfile)
router.post("/edit-profile/:slug",postEditProfile)


router.get("/change-password/:slug",changePassword)
router.post("/change-password/:slug",postChangePassword)


router.get("/forget-password",forgetPassword)
router.post("/forgot-password",postForgetPassword)
router.get("/forget-password/:slug",dynamicForgetPassword)



router.get("/verify-email-token", getVerifyEmailToken)
router.get("/verify-email",verifyEmail)

router.post("/resend-verification-link",resendVerificationLink)


router.post("/new-password/:slug", newPassword)

export const main = router