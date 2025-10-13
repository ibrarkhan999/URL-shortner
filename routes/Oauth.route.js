import { Router } from "express";
import { getGoogle ,getGoogleCallback} from "../controller/Oauth.controller.js";


const router = Router()

router.get("/google",getGoogle)
router.get("/google/callback",getGoogleCallback)

export const Oauth = router