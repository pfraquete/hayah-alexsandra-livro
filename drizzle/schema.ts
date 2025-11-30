import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, boolean, json, index, serial, unique } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const orderStatusEnum = pgEnum("order_status", [
  "AGUARDANDO_PAGAMENTO",
  "PAGO",
  "EM_SEPARACAO",
  "POSTADO",
  "EM_TRANSITO",
  "ENTREGUE",
  "CANCELADO",
  "REEMBOLSADO",
]);

export const shipmentStatusEnum = pgEnum("shipment_status", [
  "PENDENTE",
  "ETIQUETA_GERADA",
  "POSTADO",
  "EM_TRANSITO",
  "SAIU_PARA_ENTREGA",
  "ENTREGUE",
  "DEVOLVIDO",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "processing",
  "authorized",
  "paid",
  "refunded",
  "failed",
  "canceled",
]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Supabase Auth user ID. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  cpf: varchar("cpf", { length: 14 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table - Books for sale
 */
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  priceCents: integer("priceCents").notNull(),
  compareAtPriceCents: integer("compareAtPriceCents"),
  stockQuantity: integer("stockQuantity").default(0).notNull(),
  weightGrams: integer("weightGrams").default(300).notNull(),
  widthCm: decimal("widthCm", { precision: 5, scale: 2 }).default("14").notNull(),
  heightCm: decimal("heightCm", { precision: 5, scale: 2 }).default("21").notNull(),
  depthCm: decimal("depthCm", { precision: 5, scale: 2 }).default("2").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  activeIdx: index("active_idx").on(table.active),
}));

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Addresses table
 */
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  recipientName: varchar("recipientName", { length: 255 }).notNull(),
  cep: varchar("cep", { length: 10 }).notNull(),
  street: varchar("street", { length: 255 }).notNull(),
  number: varchar("number", { length: 20 }).notNull(),
  complement: varchar("complement", { length: 100 }),
  district: varchar("district", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
}));

export type Address = typeof addresses.$inferSelect;
export type InsertAddress = typeof addresses.$inferInsert;

/**
 * Orders table
 */
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  addressId: integer("addressId"),
  subtotalCents: integer("subtotalCents").notNull(),
  shippingPriceCents: integer("shippingPriceCents").notNull(),
  discountCents: integer("discountCents").default(0).notNull(),
  totalCents: integer("totalCents").notNull(),
  status: orderStatusEnum("status").default("AGUARDANDO_PAGAMENTO").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  shippingAddress: json("shippingAddress"),
  customerNotes: text("customerNotes"),
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
  shippedAt: timestamp("shippedAt"),
  deliveredAt: timestamp("deliveredAt"),
  cancelledAt: timestamp("cancelledAt"),
}, (table) => ({
  userIdIdx: index("orders_user_id_idx").on(table.userId),
  statusIdx: index("orders_status_idx").on(table.status),
}));

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table
 */
export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPriceCents: integer("unitPriceCents").notNull(),
  totalPriceCents: integer("totalPriceCents").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Shipments table
 */
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull().unique(),
  shippingMethod: varchar("shippingMethod", { length: 50 }).notNull(),
  shippingPriceCents: integer("shippingPriceCents").notNull(),
  trackingCode: varchar("trackingCode", { length: 50 }),
  trackingUrl: varchar("trackingUrl", { length: 500 }),
  status: shipmentStatusEnum("status").default("PENDENTE").notNull(),
  labelUrl: varchar("labelUrl", { length: 500 }),
  estimatedDeliveryDays: integer("estimatedDeliveryDays"),
  postedAt: timestamp("postedAt"),
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = typeof shipments.$inferInsert;

/**
 * Payment transactions table
 */
export const paymentTransactions = pgTable("paymentTransactions", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  externalId: varchar("externalId", { length: 100 }),
  gateway: varchar("gateway", { length: 50 }).default("pagarme").notNull(),
  method: varchar("method", { length: 50 }).notNull(),
  amountCents: integer("amountCents").notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  gatewayResponse: json("gatewayResponse"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

// ============================================
// SOCIAL NETWORK & COMMUNITY TABLES
// ============================================

/**
 * Creator profile enum for verification status
 */
export const creatorStatusEnum = pgEnum("creator_status", [
  "pending",
  "approved",
  "rejected",
  "suspended",
]);

/**
 * Post visibility enum
 */
export const postVisibilityEnum = pgEnum("post_visibility", [
  "public",
  "followers",
  "private",
]);

/**
 * Course status enum
 */
export const courseStatusEnum = pgEnum("course_status", [
  "draft",
  "published",
  "archived",
]);

/**
 * Lesson type enum
 */
export const lessonTypeEnum = pgEnum("lesson_type", [
  "video",
  "text",
  "quiz",
  "download",
]);

/**
 * Creator profiles - Users who can create content and sell courses
 */
export const creatorProfiles = pgTable("creatorProfiles", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  bio: text("bio"),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  coverUrl: varchar("coverUrl", { length: 500 }),
  instagram: varchar("instagram", { length: 100 }),
  youtube: varchar("youtube", { length: 100 }),
  website: varchar("website", { length: 255 }),
  status: creatorStatusEnum("status").default("pending").notNull(),
  followersCount: integer("followersCount").default(0).notNull(),
  postsCount: integer("postsCount").default(0).notNull(),
  coursesCount: integer("coursesCount").default(0).notNull(),
  totalEarningsCents: integer("totalEarningsCents").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("creator_user_id_idx").on(table.userId),
  statusIdx: index("creator_status_idx").on(table.status),
}));

export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type InsertCreatorProfile = typeof creatorProfiles.$inferInsert;

/**
 * Followers - Relationship between users
 */
export const followers = pgTable("followers", {
  id: serial("id").primaryKey(),
  followerId: integer("followerId").notNull(),
  followingId: integer("followingId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  followerIdx: index("follower_id_idx").on(table.followerId),
  followingIdx: index("following_id_idx").on(table.followingId),
  uniqueFollow: unique("unique_follow").on(table.followerId, table.followingId),
}));

export type Follower = typeof followers.$inferSelect;
export type InsertFollower = typeof followers.$inferInsert;

/**
 * Posts - Feed posts from creators
 */
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  creatorId: integer("creatorId").notNull(),
  content: text("content"),
  visibility: postVisibilityEnum("visibility").default("public").notNull(),
  likesCount: integer("likesCount").default(0).notNull(),
  commentsCount: integer("commentsCount").default(0).notNull(),
  sharesCount: integer("sharesCount").default(0).notNull(),
  isPinned: boolean("isPinned").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  creatorIdx: index("post_creator_id_idx").on(table.creatorId),
  createdAtIdx: index("post_created_at_idx").on(table.createdAt),
  visibilityIdx: index("post_visibility_idx").on(table.visibility),
}));

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Post media - Images and videos attached to posts
 */
export const postMedia = pgTable("postMedia", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  mediaUrl: varchar("mediaUrl", { length: 500 }).notNull(),
  mediaType: varchar("mediaType", { length: 20 }).notNull(), // 'image' | 'video'
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  orderIndex: integer("orderIndex").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("media_post_id_idx").on(table.postId),
}));

export type PostMedia = typeof postMedia.$inferSelect;
export type InsertPostMedia = typeof postMedia.$inferInsert;

/**
 * Post likes
 */
export const postLikes = pgTable("postLikes", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  userId: integer("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("like_post_id_idx").on(table.postId),
  userIdx: index("like_user_id_idx").on(table.userId),
  uniqueLike: unique("unique_like").on(table.postId, table.userId),
}));

export type PostLike = typeof postLikes.$inferSelect;
export type InsertPostLike = typeof postLikes.$inferInsert;

/**
 * Post comments
 */
export const postComments = pgTable("postComments", {
  id: serial("id").primaryKey(),
  postId: integer("postId").notNull(),
  userId: integer("userId").notNull(),
  parentId: integer("parentId"), // For replies
  content: text("content").notNull(),
  likesCount: integer("likesCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  postIdx: index("comment_post_id_idx").on(table.postId),
  userIdx: index("comment_user_id_idx").on(table.userId),
  parentIdx: index("comment_parent_id_idx").on(table.parentId),
}));

export type PostComment = typeof postComments.$inferSelect;
export type InsertPostComment = typeof postComments.$inferInsert;

/**
 * Comment likes
 */
export const commentLikes = pgTable("commentLikes", {
  id: serial("id").primaryKey(),
  commentId: integer("commentId").notNull(),
  userId: integer("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  commentIdx: index("clike_comment_id_idx").on(table.commentId),
  userIdx: index("clike_user_id_idx").on(table.userId),
  uniqueCommentLike: unique("unique_comment_like").on(table.commentId, table.userId),
}));

export type CommentLike = typeof commentLikes.$inferSelect;
export type InsertCommentLike = typeof commentLikes.$inferInsert;

// ============================================
// MARKETPLACE & COURSES TABLES
// ============================================

/**
 * Courses - Online courses created by creators
 */
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  creatorId: integer("creatorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  previewVideoUrl: varchar("previewVideoUrl", { length: 500 }),
  priceCents: integer("priceCents").notNull(),
  compareAtPriceCents: integer("compareAtPriceCents"),
  status: courseStatusEnum("status").default("draft").notNull(),
  totalDurationMinutes: integer("totalDurationMinutes").default(0).notNull(),
  lessonsCount: integer("lessonsCount").default(0).notNull(),
  studentsCount: integer("studentsCount").default(0).notNull(),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0"),
  reviewsCount: integer("reviewsCount").default(0).notNull(),
  isFeatured: boolean("isFeatured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  publishedAt: timestamp("publishedAt"),
}, (table) => ({
  creatorIdx: index("course_creator_id_idx").on(table.creatorId),
  slugIdx: index("course_slug_idx").on(table.slug),
  statusIdx: index("course_status_idx").on(table.status),
}));

export type Course = typeof courses.$inferSelect;
export type InsertCourse = typeof courses.$inferInsert;

/**
 * Course modules - Sections of a course
 */
export const courseModules = pgTable("courseModules", {
  id: serial("id").primaryKey(),
  courseId: integer("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  orderIndex: integer("orderIndex").default(0).notNull(),
  lessonsCount: integer("lessonsCount").default(0).notNull(),
  durationMinutes: integer("durationMinutes").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  courseIdx: index("module_course_id_idx").on(table.courseId),
}));

export type CourseModule = typeof courseModules.$inferSelect;
export type InsertCourseModule = typeof courseModules.$inferInsert;

/**
 * Course lessons - Individual lessons within modules
 */
export const courseLessons = pgTable("courseLessons", {
  id: serial("id").primaryKey(),
  moduleId: integer("moduleId").notNull(),
  courseId: integer("courseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  lessonType: lessonTypeEnum("lessonType").default("video").notNull(),
  videoUrl: varchar("videoUrl", { length: 500 }),
  videoDurationSeconds: integer("videoDurationSeconds"),
  content: text("content"), // For text lessons
  downloadUrl: varchar("downloadUrl", { length: 500 }), // For downloadable materials
  orderIndex: integer("orderIndex").default(0).notNull(),
  isFree: boolean("isFree").default(false).notNull(), // Free preview lessons
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  moduleIdx: index("lesson_module_id_idx").on(table.moduleId),
  courseIdx: index("lesson_course_id_idx").on(table.courseId),
}));

export type CourseLesson = typeof courseLessons.$inferSelect;
export type InsertCourseLesson = typeof courseLessons.$inferInsert;

/**
 * Course enrollments - Students enrolled in courses
 */
export const courseEnrollments = pgTable("courseEnrollments", {
  id: serial("id").primaryKey(),
  courseId: integer("courseId").notNull(),
  userId: integer("userId").notNull(),
  orderId: integer("orderId"), // Link to payment order if paid
  pricePaidCents: integer("pricePaidCents").notNull(),
  progressPercent: integer("progressPercent").default(0).notNull(),
  completedLessonsCount: integer("completedLessonsCount").default(0).notNull(),
  lastAccessedAt: timestamp("lastAccessedAt"),
  completedAt: timestamp("completedAt"),
  certificateUrl: varchar("certificateUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  courseIdx: index("enrollment_course_id_idx").on(table.courseId),
  userIdx: index("enrollment_user_id_idx").on(table.userId),
  uniqueEnrollment: unique("unique_enrollment").on(table.courseId, table.userId),
}));

export type CourseEnrollment = typeof courseEnrollments.$inferSelect;
export type InsertCourseEnrollment = typeof courseEnrollments.$inferInsert;

/**
 * Lesson progress - Track user progress on individual lessons
 */
export const lessonProgress = pgTable("lessonProgress", {
  id: serial("id").primaryKey(),
  lessonId: integer("lessonId").notNull(),
  userId: integer("userId").notNull(),
  enrollmentId: integer("enrollmentId").notNull(),
  isCompleted: boolean("isCompleted").default(false).notNull(),
  watchedSeconds: integer("watchedSeconds").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  lessonIdx: index("progress_lesson_id_idx").on(table.lessonId),
  userIdx: index("progress_user_id_idx").on(table.userId),
  enrollmentIdx: index("progress_enrollment_id_idx").on(table.enrollmentId),
  uniqueProgress: unique("unique_progress").on(table.lessonId, table.userId),
}));

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type InsertLessonProgress = typeof lessonProgress.$inferInsert;

/**
 * Course reviews - Student reviews and ratings
 */
export const courseReviews = pgTable("courseReviews", {
  id: serial("id").primaryKey(),
  courseId: integer("courseId").notNull(),
  userId: integer("userId").notNull(),
  enrollmentId: integer("enrollmentId").notNull(),
  rating: integer("rating").notNull(), // 1-5
  title: varchar("title", { length: 255 }),
  content: text("content"),
  isVerified: boolean("isVerified").default(false).notNull(), // Verified purchase
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, (table) => ({
  courseIdx: index("review_course_id_idx").on(table.courseId),
  userIdx: index("review_user_id_idx").on(table.userId),
  uniqueReview: unique("unique_review").on(table.courseId, table.userId),
}));

export type CourseReview = typeof courseReviews.$inferSelect;
export type InsertCourseReview = typeof courseReviews.$inferInsert;

/**
 * Digital products - Ebooks and other digital downloads
 */
export const digitalProducts = pgTable("digitalProducts", {
  id: serial("id").primaryKey(),
  creatorId: integer("creatorId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
  previewUrl: varchar("previewUrl", { length: 500 }), // Preview file
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(), // Main file
  fileType: varchar("fileType", { length: 50 }).notNull(), // pdf, epub, etc.
  fileSizeBytes: integer("fileSizeBytes"),
  priceCents: integer("priceCents").notNull(),
  compareAtPriceCents: integer("compareAtPriceCents"),
  status: courseStatusEnum("status").default("draft").notNull(),
  salesCount: integer("salesCount").default(0).notNull(),
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0"),
  reviewsCount: integer("reviewsCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  publishedAt: timestamp("publishedAt"),
}, (table) => ({
  creatorIdx: index("digital_creator_id_idx").on(table.creatorId),
  slugIdx: index("digital_slug_idx").on(table.slug),
  statusIdx: index("digital_status_idx").on(table.status),
}));

export type DigitalProduct = typeof digitalProducts.$inferSelect;
export type InsertDigitalProduct = typeof digitalProducts.$inferInsert;

/**
 * Digital product purchases
 */
export const digitalPurchases = pgTable("digitalPurchases", {
  id: serial("id").primaryKey(),
  productId: integer("productId").notNull(),
  userId: integer("userId").notNull(),
  orderId: integer("orderId"),
  pricePaidCents: integer("pricePaidCents").notNull(),
  downloadCount: integer("downloadCount").default(0).notNull(),
  lastDownloadedAt: timestamp("lastDownloadedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  productIdx: index("purchase_product_id_idx").on(table.productId),
  userIdx: index("purchase_user_id_idx").on(table.userId),
  uniquePurchase: unique("unique_purchase").on(table.productId, table.userId),
}));

export type DigitalPurchase = typeof digitalPurchases.$inferSelect;
export type InsertDigitalPurchase = typeof digitalPurchases.$inferInsert;

/**
 * Notifications - User notifications
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'like', 'comment', 'follow', 'purchase', etc.
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  linkUrl: varchar("linkUrl", { length: 500 }),
  isRead: boolean("isRead").default(false).notNull(),
  metadata: json("metadata"), // Additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("notification_user_id_idx").on(table.userId),
  readIdx: index("notification_is_read_idx").on(table.isRead),
  createdAtIdx: index("notification_created_at_idx").on(table.createdAt),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
