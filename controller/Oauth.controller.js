import { decodeIdToken, generateCodeVerifier, generateState } from "arctic";
import { google } from "../utils/google.js";
import {
  createUserWithOauth,
  getUserWithOauthId,
  linkUserWithOauth,
} from "../services/auth.services.js";
import { authTokens } from "../utils/jwt.js";

export const getGoogle = async (req, res) => {
  if (req.user) return res.redirect("/");

  const state = generateState();
  const codeVerifier = generateCodeVerifier();

  const url = google.createAuthorizationURL(state, codeVerifier, [
    "openid",
    "profile",
    "email",
  ]);

  const cookieConfig = {
    httpOnly: true, // can't be accessed by JS (safer)
    secure: true, // only sent over HTTPS
    maxAge: 1000 * 60 * 10, // 10 minutes in milliseconds
    sameSite: "lax", // helps prevent CSRF
  };

  res.cookie("cookieState", state, cookieConfig);
  res.cookie("cookieVerifier", codeVerifier, cookieConfig);

  res.redirect(url.toString());
};




export const getGoogleCallback = async (req, res) => {
  const { code, state } = req.query;

  const { cookieState, cookieVerifier } = req.cookies;

  if (
    !code ||
    !state ||
    !cookieState ||
    !cookieVerifier ||
    state !== cookieState
  ) {
    return res.redirect("/login");
  }

  let token;

  try {
    token = await google.validateAuthorizationCode(code, cookieVerifier);
  } catch (error) {
    return res.redirect("/login");
  }

  const claims = decodeIdToken(token.idToken());
  const { sub: googleUserId, name, email } = claims;

  let user = await getUserWithOauthId({ provider: "google", email });

  if (user && !user.providerAccountId) {
    await linkUserWithOauth({
      userId: user.id,
      provider: "google",
      providerAccountId: googleUserId,
    });
  }

  if (!user) {
    user = await createUserWithOauth({
      name,
      email,
      provider: "google",
      providerAccountId: googleUserId,
    });
  }

  await authTokens({ req, res, user, name, email });

  res.redirect("/");
};
