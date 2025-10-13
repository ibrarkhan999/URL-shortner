import express from "express"
import { getDelete, getEdit, getUrlPage, postEdit, postUrl, redirectToLink } from "../controller/shortner.controller.js";

export const shortnerRoute = express.Router()





//TO SHOW URL PAGE UI
shortnerRoute.get("/urlshortner",getUrlPage)

// POST URL FORM
shortnerRoute.post("/urlshortner",postUrl)

// CLICK TO REDIRECT LINK PAGE
shortnerRoute.get("/urlshortner/:shortCode",redirectToLink)


 shortnerRoute.get("/edit/:id",getEdit)
 shortnerRoute.post("/edit/:id",postEdit)

 shortnerRoute.get("/delete/:id",getDelete)
