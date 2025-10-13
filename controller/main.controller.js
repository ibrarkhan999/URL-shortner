import  argon2  from "argon2";
import {
  checkDbToken,
  clearVerifyEmailTokens,
  createPasswordLink,
  findUser,
  findUserById,
  findVerificationEmailToken,
  newSendVerification,
  resetPasswordc,
  updateName,
  updatePassword,
  verifyUserEmailAndUpdate,
} from "../services/auth.services.js";
import { allShortLink } from "../services/services.js";
import { zodEmailVerify } from "../validator/validator.js";
import { getHtmlFromMjml } from "../utils/mjmltohtml.js";
import { sendEmaill } from "../utils/sendEmail.js";

export const getIndex = (req, res) => {
  res.render("index");
};

export const getProfile = async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.redirect("/login");

  const allShortLinks = await allShortLink(user.id);

  return res.render("profile", { user, allShortLinks });
};
// verify-email
export const verifyEmail = async (req, res) => {
  if (!req.user || req.user.isValidEmail) return res.redirect("/");

  res.render("verifyEmail", { email: req.user.email });
};

export const resendVerificationLink = async (req, res) => {
  if(!req.user) return res.redirect("/")
   const user = await findUserById(req.user.id);
  if (!req.user || req.user.isValidEmail) return res.redirect("/");

    await newSendVerification({email: req.user.email,userId:req.user.id})
  res.redirect("/verify-email");
};


export const getVerifyEmailToken = async (req,res) =>  {
   const {data, error} = zodEmailVerify.safeParse(req.query)
   if(error){
    return res.send("verification link invalid")
   }

   const [token] = await findVerificationEmailToken(data)

   console.log(token)

   if(!token) res.send("Verification link invalid or expire")

    await verifyUserEmailAndUpdate(token.email)

    await clearVerifyEmailTokens(token.email)

    res.redirect("/profile")
}


export const EditProfile = async (req,res) => {
  const userId = req.params.slug
 const user = await findUserById(userId)
res.render("profileEdit",{user})
}


export const postEditProfile = async (req,res) => {
    const userId = req.params.slug
    const{name} = req.body
  const user = await updateName({userId,name})
res.redirect("/profile")
}


export const changePassword = async (req,res) => {
  const userId = req.params.slug
   res.render("changePassword",{userId,errors : req.flash("errors")});
}


export const postChangePassword = async (req,res) => {
const userId = req.params.slug
const{currentPassword,newPassword,confirmPassword} = req.body
const user = await findUserById(userId)
const vPass = await argon2.verify(user.password, currentPassword);
    if (!vPass){
      req.flash("errors","Incorrect Current Password")
      return res.redirect(`/change-password/${userId}`)
    }
    if(newPassword !== confirmPassword){
      req.flash("errors","Incorrect Confirm Password")
      return res.redirect(`/change-password/${userId}`)

}


const updated = await updatePassword({newPassword,userId})


  

res.redirect("/profile")
}


export const forgetPassword = async (req,res) => {
  res.render("forgetPassword")

}


export const postForgetPassword = async (req,res) => {
 const {email} = req.body
const user = await findUser(email)
if(!user) return res.redirect("/login")


  const resetLink = await createPasswordLink({userId:user.id})
  
const html = await getHtmlFromMjml("forger-password",{
  name:user.name,
  link : resetLink
})

sendEmaill({
  to :user.email,
  subject : "Reset Your Password",
  html : html,

})

return res.render("done" ,{email : user.email})
}


export const dynamicForgetPassword = async (req,res) => {
  const token = req.params.slug
 const dbToken = await checkDbToken(token)
if(!dbToken) return res.render("invalid-token")

return res.render("reset-password-page",{dbToken:dbToken.tokenHash,userId:dbToken.userId})
}


export const newPassword = async (req, res) => {
const {newPassword , confirmPassword , userId} = req.body

if(newPassword !== confirmPassword) return res.send("<h1>confirm password invalid</h1>")

const resetPassword = await resetPasswordc({confirmPassword,userId})
return res.redirect("/login")
}