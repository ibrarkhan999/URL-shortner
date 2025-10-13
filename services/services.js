import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { shortLink } from "../drizzle/schema.js";

// READ
export const loadLinks = async (id) => {
  const allLinks = await db.select().from(shortLink).where(eq(shortLink.userId, id));
  return allLinks;
};

// READ SPECIFIC / FIND
export const getLinkByShortCode = async (shortCode) => {
  const [find] = await db.select().from(shortLink).where({
    short_code: shortCode,
  });
  return find;
};

// CREATE
export const saveLinks = async ({ url, shortCode, id }) => {
  const data = await db.insert(shortLink).values({
    url: url,
    shortCode: shortCode,
    userId: id,
  });
};


export const findByid = async (id) => {
  const [find] = await db.select().from(shortLink).where({
    id: id,
  });
  return find;
};



export const updateLink = async ({ id, url, shortCode }) => {
  const update = await db
    .update(shortLink)
    .set({
      url: url,
      shortCode: shortCode,
    })
    .where(eq(shortLink.id, id));  // condition for which row to update

  return update;
};

export const deleteLink = async (id) => {
  const dlt = await db
    .delete(shortLink).where(eq(shortLink.id, id))

  return dlt;
};



export const allShortLink = async (userid) => {
  return await db.select().from(shortLink).where(eq(shortLink.userId,userid))
}