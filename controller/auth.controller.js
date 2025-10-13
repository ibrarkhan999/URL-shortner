import argon2 from "argon2";
import { clearSessions, createUser, findUser, newSendVerification } from "../services/auth.services.js";
import { authTokens } from "../utils/jwt.js";
import { zodLogin, zodRegister } from "../validator/validator.js";

//-----------------------------------------------------------------
export const getLogin = (req, res) => {
  if(req.user) return res.redirect("/")
  res.render("auth/login",{errors : req.flash("errors")});
};

//----------------------------------------------------------------
export const postLogin = async (req, res) => {
  if(req.user) return res.redirect("/")

  const {data,success,error} = zodLogin.safeParse(req.body)

  if(!success) {
    const errorMessage = error.issues[0].message;
    req.flash("errors", errorMessage)
    return res.redirect("/login") // Added 'return' to stop execution
  }
  
  const { email, password } = data 
  
  const user = await findUser(email);
  if (!user){
    req.flash("errors","Incorrect Email or Password")
     return res.redirect("/login");
  }
  const vPass = await argon2.verify(user.password, password);

  if (!vPass){
    req.flash("errors","Incorrect Email or Password")
     return res.redirect("/login");
  }
 await authTokens({req,res,user})
  res.redirect("/");
};

//______________________________________________________________
export const getRegister = (req, res) => {
  if(req.user) return res.redirect("/")
  res.render("auth/register",{errors:req.flash("errors")});
};

//_______________________________________________________________
export const postRegister = async (req, res) => {
  if(req.user) return res.redirect("/")

  const {data,success,error} = zodRegister.safeParse(req.body)

   
  if(!success) {
    const errorMessage = error.issues[0].message;
    console.log(errorMessage)
    req.flash("errors", errorMessage)
    return res.redirect("/register") // Added 'return' to stop execution
  }
  

  const { name, email, password } = data // Now data is guaranteed to exist
  
  const userExist = await findUser(email);
  if (userExist) {
    req.flash("errors", "users already exist")
    return res.redirect("/register");
  }
  
  const [user] = await createUser({ name, email, password });

   await authTokens({req,res,user,name,email})

   await newSendVerification({userId :user.id, email})
  res.redirect("/verify-email");
};






//_________________________________________________________
export const getLogout = async (req, res) => {

const clearSess = await clearSessions(req.user.sessionId)

  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.redirect("/login");
};