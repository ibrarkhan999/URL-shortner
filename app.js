import express from "express";
import session from "express-session";
import flash from "connect-flash"
import CookieParser from "cookie-parser"
import requestIp from "request-ip"

import { shortnerRoute } from "./routes/shortner.route.js";
import { authRouter } from "./routes/auth.route.js";
import { main } from "./routes/main.route.js";
import { authVerification } from "./middleware/authMiddleware.js";
import { Oauth } from "./routes/Oauth.route.js";


export const app = express();

// MIDDLEWARES
app.use(CookieParser())
app.use(express.static("public"));
app.use(express.urlencoded());
app.set("view engine", "ejs")
app.set("views","./views")
app.use(session({secret:"lol",resave:true,saveUninitialized:false}))
app.use(flash())
app.use(requestIp.mw())


// MIDDLEWARE FUNCTIONS
app.use(authVerification)

app.use((req,res,next)=>{
    res.locals.user = req.user
    return next()
})



// ROUTES
app.use(authRouter)
app.use(shortnerRoute)
app.use(main)
app.use(Oauth)





app.use((req,res)=>{
    res.render("error")
})