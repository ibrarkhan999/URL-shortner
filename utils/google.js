import { Google } from "arctic";

export const google = new Google(
  process.env.GCLIENTID,      // from Google Cloud Console
  process.env.GCLIENTSECRET,  // from Google Cloud Console
  "http://localhost:3000/google/callback" // your redirect URL
);
