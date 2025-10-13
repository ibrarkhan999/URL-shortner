import { relations, sql } from "drizzle-orm";
import { boolean, mysqlEnum, text, timestamp } from "drizzle-orm/mysql-core";
import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const User = mysqlTable("users", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  isValidEmail: boolean("is_valid_email").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const Token = mysqlTable("token", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  token: varchar({ length: 8 }).notNull(),
  expireAt: timestamp("expire_at").default(
    sql`(CURRENT_TIMESTAMP + INTERVAL 1 DAY)`
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ResetToken = mysqlTable("reset_token", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }).unique(),
  tokenHash: text("token_hash").notNull(),
  expireAt: timestamp("expire_at").default(
    sql`(CURRENT_TIMESTAMP + INTERVAL 1 HOUR)`
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const Sessions = mysqlTable("sessions", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  valid: boolean().default(true).notNull(),
  userAgent: text("user_agent"),
  ip: varchar({ length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const shortLink = mysqlTable("short_link", {
  id: int().autoincrement().primaryKey(),
  userId: int("user_id")
    .notNull()
    .references(() => User.id, { onDelete: "cascade" }),
  url: varchar({ length: 255 }).notNull(),
  shortCode: varchar("short_code", { length: 20 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

// RELATIONS
export const usersRelations = relations(User, ({ many }) => ({
  urls: many(shortLink), // one user → many urls
  sessions: many(Sessions), // one user → many urls
}));

export const urlsRelations = relations(shortLink, ({ one }) => ({
  user: one(User, {
    fields: [shortLink.userId], // Foreign key
    references: [User.id], // referenced
  }),
}));
export const sessionsRelations = relations(Sessions, ({ one }) => ({
  user: one(User, {
    fields: [Sessions.userId], // Foreign key
    references: [User.id], // referenced
  }),
}));


export const Google = mysqlTable("google", {
  id: int().autoincrement().primaryKey(),
  userId : int("user_id").notNull().references(()=> User.id,{onDelete:"cascade"}),
  provider:mysqlEnum("provider",["google","github"]).notNull(),
  providerAccountId: varchar("provider_account_id",{length:255}).notNull().unique(),
  isValidEmail: boolean("is_valid_email").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),

});
