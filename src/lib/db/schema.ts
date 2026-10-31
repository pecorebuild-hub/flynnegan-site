import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  showInNav: boolean("show_in_nav").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const works = pgTable("works", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id")
    .notNull()
    .references(() => sections.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  series: text("series"),
  description: text("description"),
  longDescription: text("long_description"),
  edition: text("edition"),
  year: text("year"),
  price: text("price"),
  buyUrl: text("buy_url"),
  prodigiSku: text("prodigi_sku"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workImages = pgTable("work_images", {
  id: serial("id").primaryKey(),
  workId: integer("work_id")
    .notNull()
    .references(() => works.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  caption: text("caption"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export type Section = typeof sections.$inferSelect;
export type Work = typeof works.$inferSelect;
export type WorkImage = typeof workImages.$inferSelect;
