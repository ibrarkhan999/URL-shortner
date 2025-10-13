import { refreshTokens, verifyToken } from "../utils/jwt.js";

export const authVerification = async (req, res, next) => {
const accessToken = req.cookies.access_token
const refreshToken = req.cookies.refresh_token

req.user = null

if(!accessToken && !refreshToken){
  return next()
}

if(accessToken){
  const decodedToken = verifyToken(accessToken)
  req.user = decodedToken
  return next()
}

if(refreshToken){
  try {
        const {newAccessToken,newRefreshToken,userInfo} = await refreshTokens(refreshToken)

req.user = userInfo

  const baseConfig = { httpOnly:true, secure:true }

  res.cookie("access_token",newAccessToken,{
    ...baseConfig,
    maxAge: 15 * 60 * 1000, // 15 minutes
  })
  res.cookie("refresh_token",newRefreshToken,{
    ...baseConfig,
    maxAge:  7 * 24 * 60 * 60 * 1000, // 7 days
  })
  return next()
  } catch (error) {
    console.log(error.message)
  }

}
return next()


};
