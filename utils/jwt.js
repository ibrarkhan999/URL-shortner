import jwt from "jsonwebtoken";
import { createSession, findSessionById, findUserById } from "../services/auth.services.js";

export const createAccessToken = ({ id, name, email, sessionId ,isValidEmail}) => {
  return jwt.sign({ id, name, email, sessionId ,isValidEmail}, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};
export const createRefreshToken = (sessionId) => {
  return jwt.sign({ sessionId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const refreshTokens = async (refreshToken) => {
  try {
    const decodedToken = verifyToken(refreshToken);
    const currentSession = await findSessionById(decodedToken.sessionId);
    if (!currentSession || !currentSession.valid) {
      throw new Error("invalid session");
    }

    const user = await findUserById(currentSession.userId);
    if (!user) throw new Error("invalid User");

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      isValidEmail:false,
      sessionId: currentSession.id,
    };
    const newAccessToken = createAccessToken(userInfo);
    const newRefreshToken = createRefreshToken(currentSession.id);
    return {newAccessToken,newRefreshToken,userInfo}
  } catch (error) {
    console.log(error);
  }
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};


export const authTokens = async ({req,res,user,name,email}) => {
  
    const session = await createSession(user.id,{
    ip:req.clientIp,
    userAgent : req.headers["user-agent"]
  })

  const accessToken = createAccessToken({
    id:user.id,
    name : user.name || name,
    email : user.email || email,
    isValidEmail:user.isValidEmail,
    sessionId : session.id
  })
  const refreshToken = createRefreshToken(session.id)

  const baseConfig = { httpOnly:true, secure:true }

  res.cookie("access_token",accessToken,{
    ...baseConfig,
    maxAge: 15 * 60 * 1000, // 15 minutes
  })
  res.cookie("refresh_token",refreshToken,{
    ...baseConfig,
    maxAge:  7 * 24 * 60 * 60 * 1000, // 7 days
  })


}