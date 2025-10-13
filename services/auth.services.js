import argon2 from 'argon2';  
import { and, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "../config/db.js";
import { Google, ResetToken, Sessions, Token, User } from "../drizzle/schema.js";
import { sendEmail } from '../utils/resend.js';
import { generateRandomToken } from '../utils/randomToken.js';
import crypto from "crypto"

export const findUser = async (email) => {
  const [user] = await db.select().from(User).where(eq(User.email, email));
  return user;
};

export const createUser = async ({name,email,password}) => {
  const hash = await argon2.hash(password);
  
 const user = await db.insert(User).values({name,email,password : hash}).$returningId()

 return user

}
export const updateName = async ({userId, name}) => {
return await db.update(User).set({name}).where(eq(User.id,userId))
}

export const createSession = async (userId , {ip , userAgent}) => {
const [session] = await db.insert(Sessions).values({ userId, userAgent, ip }).$returningId()
return session
}


export const findSessionById = async (sessionId) => {
 const [session] = await db.select().from(Sessions).where(eq(Sessions.id, sessionId));
  return session;
}

export const findUserById = async (userId) => {
 const [user] = await db.select().from(User).where(eq(User.id, userId));
  return user;
}

export const clearSessions = async (sessionid) => {
  return await db.delete(Sessions).where(eq(Sessions.id,sessionid))
}


export const insertVerifyEmailToken = async ({userId, token}) => {
  return db.transaction(async(tx)=> {
    try {
      await tx.delete(Token).where(lt(Token.expireAt,sql`CURRENT_TIMESTAMP`))
      await tx.delete(Token).where(eq(Token.userId,userId))

      await tx.insert(Token).values({userId,token})      
    } catch (error) {
      console.log(error)
    }
  })
}


export const createVerifyEmailLink = async ({email, token}) => {

  const url = new URL(`${process.env.FRONTEND_URL}/verify-email-token`)

  url.searchParams.append("token",token)
  url.searchParams.append("email",email)

  return url.toString()
}


export const findVerificationEmailToken = async ({token,email}) => {
   return await db.select({
    userId: User.id,
    email: User.email,
    token : Token.token,
    expireAt:Token.expireAt
  }).from(Token)
  .where(and(
    eq(Token.token,token),
    eq(User.email ,email),
    gte(Token.expireAt,sql`CURRENT_TIMESTAMP`),
  ))
  .innerJoin(User, eq(Token.userId , User.id))

}


export const verifyUserEmailAndUpdate = async (email) => {
return await db.update(User).set({isValidEmail:true}).where(eq(User.email,email))
}


export const clearVerifyEmailTokens = async (email) => {
  const [user] = await db.select().from(User).where(eq(User.email,email))

  return await db.delete(Token).where(eq(Token.userId,user.id))
}




export const newSendVerification = async ({userId , email}) => {
   
    const randomToken = generateRandomToken();
  
    await insertVerifyEmailToken({ userId, token: randomToken });
  
    const verifyEmailLink = await createVerifyEmailLink({
      email,
      token: randomToken,
    });
  
    sendEmail({ email, randomToken, verifyEmailLink }).catch(
      (err) => console.log(err)
    );
  
}


export const updatePassword = async ({newPassword,userId}) => {
  const hash = await argon2.hash(newPassword);
  
return await db.update(User).set({password:hash}).where(eq(User.id,userId))

}


export const createPasswordLink = async ({userId}) => {

  const token = crypto.randomBytes(32).toString('hex')


 await db.delete(ResetToken).where(eq(ResetToken.userId,userId))

 await db.insert(ResetToken).values({userId:userId, tokenHash:token})

 return `${process.env.FRONTEND_URL}/forget-password/${token}`
}


export const checkDbToken = async (token) => {

  const [record] = await db.select().from(ResetToken).where(
    and(
    eq(ResetToken.tokenHash,token),
gte(ResetToken.expireAt, sql`CURRENT_TIMESTAMP`)
));

return record

};


export const resetPasswordc = async ({confirmPassword, userId}) => {
  const hash = await argon2.hash(confirmPassword);

return await db.update(User).set({password:hash}).where(eq(User.id,userId))

}


export const getUserWithOauthId = async ({ provider, email }) => {
  const [user] = await db
    .select({
      id: User.id,
      name: User.name,
      email: User.email,
      isValidEmail: User.isValidEmail,
      googleProvider: Google.provider,             // alias
      googleProviderAccountId: Google.providerAccountId, // alias
    })
    .from(User)
    .leftJoin(
      Google,
      and(eq(Google.provider, provider), eq(Google.userId, User.id))
    )
    .where(eq(User.email, email));

  if (!user) return null;

  // Map Google info to expected keys
  user.provider = user.googleProvider;
  user.providerAccountId = user.googleProviderAccountId;
  delete user.googleProvider;
  delete user.googleProviderAccountId;

  return user;
};




export const linkUserWithOauth = async ({ userId, provider, providerAccountId }) => {

  await db.insert(Google).values({ userId, provider, providerAccountId });
};


export const createUserWithOauth = async ({ name, email, provider, providerAccountId }) => {
  const user = await db.transaction(async (trx) => {
    const [user] = await trx.insert(User)
      .values({ name, email,  password: Math.random().toString(36).slice(2), isValidEmail: true })
      .$returningId(); // returns array of IDs

    await trx.insert(Google)
      .values({ provider, providerAccountId, userId : user.id });

    // return the full user object
    return { id: user.id, name, email, isValidEmail: true,provider,providerAccountId };
  });

  return user;
};










