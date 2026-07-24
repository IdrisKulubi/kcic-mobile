import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

const legacyTimestamp = (name: string) => timestamp(name)

export const admins = pgTable(
  "admins",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    name: text("name").notNull(),
    createdAt: legacyTimestamp("created_at").defaultNow().notNull(),
    updatedAt: legacyTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("admins_email_unique").on(table.email)]
)

export const heroSection = pgTable("hero_section", {
  id: text("id").primaryKey().default("default"),
  headline: text("headline").notNull(),
  subtext: text("subtext").notNull(),
  backgroundVideo: text("background_video"),
  updatedAt: legacyTimestamp("updated_at").defaultNow().notNull(),
})

export const heroButtons = pgTable(
  "hero_buttons",
  {
    id: text("id").primaryKey(),
    text: text("text").notNull(),
    href: text("href").notNull(),
    variant: text("variant").notNull(),
    order: integer("order").notNull(),
    heroId: text("hero_id")
      .notNull()
      .references(() => heroSection.id, { onDelete: "cascade" }),
  },
  (table) => [index("hero_buttons_order_idx").on(table.order)]
)

export const statistics = pgTable(
  "statistics",
  {
    id: text("id").primaryKey(),
    label: text("label").notNull(),
    value: integer("value").notNull(),
    suffix: text("suffix"),
    icon: text("icon").notNull(),
    order: integer("order").notNull(),
    createdAt: legacyTimestamp("created_at").defaultNow().notNull(),
    updatedAt: legacyTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("statistics_order_idx").on(table.order)]
)

export const news = pgTable(
  "news",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    content: text("content"),
    thumbnail: text("thumbnail").notNull(),
    category: text("category").notNull(),
    slug: text("slug").notNull(),
    readTime: text("read_time"),
    featured: boolean("featured").default(false).notNull(),
    publishedAt: legacyTimestamp("published_at").notNull(),
    createdAt: legacyTimestamp("created_at").defaultNow().notNull(),
    updatedAt: legacyTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("news_slug_unique").on(table.slug),
    index("news_slug_idx").on(table.slug),
    index("news_published_at_idx").on(table.publishedAt),
  ]
)

export const teamMembers = pgTable(
  "team_members",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    role: text("role").notNull(),
    category: text("category").default("Other").notNull(),
    bio: text("bio"),
    photo: text("photo").notNull(),
    email: text("email"),
    linkedin: text("linkedin"),
    twitter: text("twitter"),
    order: integer("order").notNull(),
    createdAt: legacyTimestamp("created_at").defaultNow().notNull(),
    updatedAt: legacyTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("team_members_order_idx").on(table.order),
    index("team_members_category_idx").on(table.category),
  ]
)

export const partners = pgTable(
  "partners",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    logo: text("logo").notNull(),
    website: text("website"),
    order: integer("order").notNull(),
    createdAt: legacyTimestamp("created_at").defaultNow().notNull(),
    updatedAt: legacyTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("partners_order_idx").on(table.order)]
)

export const programmes = pgTable(
  "programmes",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull(),
    image: text("image").notNull(),
    headerImage: text("header_image"),
    color: text("color").notNull(),
    order: integer("order").notNull(),
    isActive: boolean("is_active").default(false).notNull(),
    category: text("category").default("flagship").notNull(),
    applicationLink: text("application_link"),
    introduction: text("introduction"),
    applicationProcess: text("application_process"),
    criteria: text("criteria"),
    eligibility: text("eligibility"),
    applicationSelection: text("application_selection"),
    technicalSupport: text("technical_support"),
    definitions: text("definitions"),
    terms: text("terms"),
    scoringSystem: text("scoring_system"),
    fraudPolicy: text("fraud_policy"),
    createdAt: legacyTimestamp("created_at").defaultNow().notNull(),
    updatedAt: legacyTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("programmes_slug_unique").on(table.slug),
    index("programmes_order_idx").on(table.order),
    index("programmes_slug_idx").on(table.slug),
  ]
)

export const programmeSponsors = pgTable(
  "programme_sponsors",
  {
    id: text("id").primaryKey(),
    programmeId: text("programme_id")
      .notNull()
      .references(() => programmes.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    logo: text("logo").notNull(),
    order: integer("order").notNull(),
    createdAt: legacyTimestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("programme_sponsors_programme_idx").on(table.programmeId),
    index("programme_sponsors_order_idx").on(table.order),
  ]
)

export const footerSection = pgTable("footer_section", {
  id: text("id").primaryKey().default("default"),
  contactAddress: text("contact_address").notNull(),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  newsletterTitle: text("newsletter_title").notNull(),
  newsletterDescription: text("newsletter_description").notNull(),
  newsletterPlaceholder: text("newsletter_placeholder").notNull(),
  copyright: text("copyright").notNull(),
  updatedAt: legacyTimestamp("updated_at").defaultNow().notNull(),
})

export const footerLinks = pgTable(
  "footer_links",
  {
    id: text("id").primaryKey(),
    label: text("label").notNull(),
    href: text("href").notNull(),
    order: integer("order").notNull(),
  },
  (table) => [index("footer_links_order_idx").on(table.order)]
)

export const footerSocialMedia = pgTable(
  "footer_social_media",
  {
    id: text("id").primaryKey(),
    platform: text("platform").notNull(),
    href: text("href").notNull(),
    icon: text("icon").notNull(),
    order: integer("order").notNull(),
  },
  (table) => [index("footer_social_media_order_idx").on(table.order)]
)

export const ctaBanner = pgTable("cta_banner", {
  id: text("id").primaryKey().default("default"),
  headline: text("headline").notNull(),
  subtext: text("subtext"),
  buttonText: text("button_text").notNull(),
  buttonHref: text("button_href").notNull(),
  updatedAt: legacyTimestamp("updated_at").defaultNow().notNull(),
})

export const opportunities = pgTable(
  "opportunities",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    type: text("type").notNull(),
    referenceNumber: text("reference_number"),
    summary: text("summary").notNull(),
    description: text("description"),
    department: text("department"),
    location: text("location"),
    workMode: text("work_mode"),
    employmentType: text("employment_type"),
    requirements: text("requirements"),
    qualifications: text("qualifications"),
    responsibilities: text("responsibilities"),
    applicationEmail: text("application_email"),
    applicationLink: text("application_link"),
    applicationInstructions: text("application_instructions"),
    deadline: legacyTimestamp("deadline"),
    issuedDate: legacyTimestamp("issued_date"),
    isActive: boolean("is_active").default(true).notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),
    createdAt: legacyTimestamp("created_at").defaultNow().notNull(),
    updatedAt: legacyTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("opportunities_slug_unique").on(table.slug),
    index("opportunities_slug_idx").on(table.slug),
    index("opportunities_type_idx").on(table.type),
    index("opportunities_active_idx").on(table.isActive),
  ]
)

export const opportunityAttachments = pgTable(
  "opportunity_attachments",
  {
    id: text("id").primaryKey(),
    opportunityId: text("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    fileName: text("file_name").notNull(),
    fileUrl: text("file_url").notNull(),
    fileType: text("file_type"),
    fileSize: integer("file_size"),
    order: integer("order").default(0).notNull(),
    createdAt: legacyTimestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("opportunity_attachments_opportunity_idx").on(table.opportunityId),
    index("opportunity_attachments_order_idx").on(table.order),
  ]
)

export const whistleblowerReports = pgTable(
  "whistleblower_reports",
  {
    id: text("id").primaryKey(),
    referenceNumber: text("reference_number").notNull(),
    category: text("category").notNull(),
    subject: text("subject").notNull(),
    description: text("description").notNull(),
    incidentDate: legacyTimestamp("incident_date"),
    department: text("department"),
    involvedParties: text("involved_parties"),
    evidence: text("evidence"),
    contactEmail: text("contact_email"),
    isAnonymous: boolean("is_anonymous").default(true).notNull(),
    status: text("status").default("new").notNull(),
    adminNotes: text("admin_notes"),
    reviewedBy: text("reviewed_by"),
    reviewedAt: legacyTimestamp("reviewed_at"),
    createdAt: legacyTimestamp("created_at").defaultNow().notNull(),
    updatedAt: legacyTimestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("whistleblower_reports_reference_number_unique").on(
      table.referenceNumber
    ),
    index("whistleblower_status_idx").on(table.status),
    index("whistleblower_category_idx").on(table.category),
    index("whistleblower_created_at_idx").on(table.createdAt),
  ]
)

export const heroSectionRelations = relations(heroSection, ({ many }) => ({
  buttons: many(heroButtons),
}))

export const heroButtonsRelations = relations(heroButtons, ({ one }) => ({
  hero: one(heroSection, {
    fields: [heroButtons.heroId],
    references: [heroSection.id],
  }),
}))

export const programmesRelations = relations(programmes, ({ many }) => ({
  sponsors: many(programmeSponsors),
}))

export const programmeSponsorsRelations = relations(
  programmeSponsors,
  ({ one }) => ({
    programme: one(programmes, {
      fields: [programmeSponsors.programmeId],
      references: [programmes.id],
    }),
  })
)

export const opportunitiesRelations = relations(opportunities, ({ many }) => ({
  attachments: many(opportunityAttachments),
}))

export const opportunityAttachmentsRelations = relations(
  opportunityAttachments,
  ({ one }) => ({
    opportunity: one(opportunities, {
      fields: [opportunityAttachments.opportunityId],
      references: [opportunities.id],
    }),
  })
)
