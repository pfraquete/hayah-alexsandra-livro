var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  addresses: () => addresses,
  commentLikes: () => commentLikes,
  courseEnrollments: () => courseEnrollments,
  courseLessons: () => courseLessons,
  courseModules: () => courseModules,
  courseReviews: () => courseReviews,
  courseStatusEnum: () => courseStatusEnum,
  courses: () => courses,
  creatorProfiles: () => creatorProfiles,
  creatorStatusEnum: () => creatorStatusEnum,
  digitalProducts: () => digitalProducts,
  digitalPurchases: () => digitalPurchases,
  followers: () => followers,
  lessonProgress: () => lessonProgress,
  lessonTypeEnum: () => lessonTypeEnum,
  notifications: () => notifications,
  orderItems: () => orderItems,
  orderStatusEnum: () => orderStatusEnum,
  orders: () => orders,
  paymentStatusEnum: () => paymentStatusEnum,
  paymentTransactions: () => paymentTransactions,
  postComments: () => postComments,
  postLikes: () => postLikes,
  postMedia: () => postMedia,
  postVisibilityEnum: () => postVisibilityEnum,
  posts: () => posts,
  productTypeEnum: () => productTypeEnum,
  products: () => products,
  roleEnum: () => roleEnum,
  shipmentStatusEnum: () => shipmentStatusEnum,
  shipments: () => shipments,
  users: () => users
});
import { integer, pgEnum, pgTable, text, timestamp, varchar, decimal, boolean, json, index, serial, unique } from "drizzle-orm/pg-core";
var roleEnum, productTypeEnum, orderStatusEnum, shipmentStatusEnum, paymentStatusEnum, users, products, addresses, orders, orderItems, shipments, paymentTransactions, creatorStatusEnum, postVisibilityEnum, courseStatusEnum, lessonTypeEnum, creatorProfiles, followers, posts, postMedia, postLikes, postComments, commentLikes, courses, courseModules, courseLessons, courseEnrollments, lessonProgress, courseReviews, digitalProducts, digitalPurchases, notifications;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    roleEnum = pgEnum("role", ["user", "admin"]);
    productTypeEnum = pgEnum("product_type", ["physical", "digital"]);
    orderStatusEnum = pgEnum("order_status", [
      "AGUARDANDO_PAGAMENTO",
      "PAGO",
      "EM_SEPARACAO",
      "POSTADO",
      "EM_TRANSITO",
      "ENTREGUE",
      "CANCELADO",
      "REEMBOLSADO"
    ]);
    shipmentStatusEnum = pgEnum("shipment_status", [
      "PENDENTE",
      "ETIQUETA_GERADA",
      "POSTADO",
      "EM_TRANSITO",
      "SAIU_PARA_ENTREGA",
      "ENTREGUE",
      "DEVOLVIDO"
    ]);
    paymentStatusEnum = pgEnum("payment_status", [
      "pending",
      "processing",
      "authorized",
      "paid",
      "refunded",
      "failed",
      "canceled"
    ]);
    users = pgTable("users", {
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
      active: boolean("active").default(true).notNull()
    });
    products = pgTable("products", {
      id: serial("id").primaryKey(),
      creatorId: integer("creatorId"),
      productType: productTypeEnum("productType").default("physical").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      description: text("description"),
      priceCents: integer("priceCents").notNull(),
      compareAtPriceCents: integer("compareAtPriceCents"),
      // Physical product fields (optional for digital products)
      stockQuantity: integer("stockQuantity").default(0),
      weightGrams: integer("weightGrams"),
      widthCm: decimal("widthCm", { precision: 5, scale: 2 }),
      heightCm: decimal("heightCm", { precision: 5, scale: 2 }),
      depthCm: decimal("depthCm", { precision: 5, scale: 2 }),
      // Digital product fields (optional for physical products)
      fileUrl: varchar("fileUrl", { length: 500 }),
      fileType: varchar("fileType", { length: 50 }),
      fileSizeBytes: integer("fileSizeBytes"),
      imageUrl: varchar("imageUrl", { length: 500 }),
      active: boolean("active").default(true).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      activeIdx: index("active_idx").on(table.active)
    }));
    addresses = pgTable("addresses", {
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
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      userIdIdx: index("user_id_idx").on(table.userId)
    }));
    orders = pgTable("orders", {
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
      cancelledAt: timestamp("cancelledAt")
    }, (table) => ({
      userIdIdx: index("orders_user_id_idx").on(table.userId),
      statusIdx: index("orders_status_idx").on(table.status)
    }));
    orderItems = pgTable("orderItems", {
      id: serial("id").primaryKey(),
      orderId: integer("orderId").notNull(),
      productId: integer("productId").notNull(),
      quantity: integer("quantity").default(1).notNull(),
      unitPriceCents: integer("unitPriceCents").notNull(),
      totalPriceCents: integer("totalPriceCents").notNull(),
      productName: varchar("productName", { length: 255 }).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    shipments = pgTable("shipments", {
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
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    paymentTransactions = pgTable("paymentTransactions", {
      id: serial("id").primaryKey(),
      orderId: integer("orderId").notNull(),
      externalId: varchar("externalId", { length: 100 }),
      gateway: varchar("gateway", { length: 50 }).default("pagarme").notNull(),
      method: varchar("method", { length: 50 }).notNull(),
      amountCents: integer("amountCents").notNull(),
      status: paymentStatusEnum("status").default("pending").notNull(),
      gatewayResponse: json("gatewayResponse"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    creatorStatusEnum = pgEnum("creator_status", [
      "pending",
      "approved",
      "rejected",
      "suspended"
    ]);
    postVisibilityEnum = pgEnum("post_visibility", [
      "public",
      "followers",
      "private"
    ]);
    courseStatusEnum = pgEnum("course_status", [
      "draft",
      "published",
      "archived"
    ]);
    lessonTypeEnum = pgEnum("lesson_type", [
      "video",
      "text",
      "quiz",
      "download"
    ]);
    creatorProfiles = pgTable("creatorProfiles", {
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
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      userIdIdx: index("creator_user_id_idx").on(table.userId),
      statusIdx: index("creator_status_idx").on(table.status)
    }));
    followers = pgTable("followers", {
      id: serial("id").primaryKey(),
      followerId: integer("followerId").notNull(),
      followingId: integer("followingId").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      followerIdx: index("follower_id_idx").on(table.followerId),
      followingIdx: index("following_id_idx").on(table.followingId),
      uniqueFollow: unique("unique_follow").on(table.followerId, table.followingId)
    }));
    posts = pgTable("posts", {
      id: serial("id").primaryKey(),
      creatorId: integer("creatorId").notNull(),
      content: text("content"),
      visibility: postVisibilityEnum("visibility").default("public").notNull(),
      likesCount: integer("likesCount").default(0).notNull(),
      commentsCount: integer("commentsCount").default(0).notNull(),
      sharesCount: integer("sharesCount").default(0).notNull(),
      isPinned: boolean("isPinned").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      creatorIdx: index("post_creator_id_idx").on(table.creatorId),
      createdAtIdx: index("post_created_at_idx").on(table.createdAt),
      visibilityIdx: index("post_visibility_idx").on(table.visibility)
    }));
    postMedia = pgTable("postMedia", {
      id: serial("id").primaryKey(),
      postId: integer("postId").notNull(),
      mediaUrl: varchar("mediaUrl", { length: 500 }).notNull(),
      mediaType: varchar("mediaType", { length: 20 }).notNull(),
      // 'image' | 'video'
      thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
      orderIndex: integer("orderIndex").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      postIdx: index("media_post_id_idx").on(table.postId)
    }));
    postLikes = pgTable("postLikes", {
      id: serial("id").primaryKey(),
      postId: integer("postId").notNull(),
      userId: integer("userId").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      postIdx: index("like_post_id_idx").on(table.postId),
      userIdx: index("like_user_id_idx").on(table.userId),
      uniqueLike: unique("unique_like").on(table.postId, table.userId)
    }));
    postComments = pgTable("postComments", {
      id: serial("id").primaryKey(),
      postId: integer("postId").notNull(),
      userId: integer("userId").notNull(),
      parentId: integer("parentId"),
      // For replies
      content: text("content").notNull(),
      likesCount: integer("likesCount").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      postIdx: index("comment_post_id_idx").on(table.postId),
      userIdx: index("comment_user_id_idx").on(table.userId),
      parentIdx: index("comment_parent_id_idx").on(table.parentId)
    }));
    commentLikes = pgTable("commentLikes", {
      id: serial("id").primaryKey(),
      commentId: integer("commentId").notNull(),
      userId: integer("userId").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      commentIdx: index("clike_comment_id_idx").on(table.commentId),
      userIdx: index("clike_user_id_idx").on(table.userId),
      uniqueCommentLike: unique("unique_comment_like").on(table.commentId, table.userId)
    }));
    courses = pgTable("courses", {
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
      publishedAt: timestamp("publishedAt")
    }, (table) => ({
      creatorIdx: index("course_creator_id_idx").on(table.creatorId),
      slugIdx: index("course_slug_idx").on(table.slug),
      statusIdx: index("course_status_idx").on(table.status)
    }));
    courseModules = pgTable("courseModules", {
      id: serial("id").primaryKey(),
      courseId: integer("courseId").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      orderIndex: integer("orderIndex").default(0).notNull(),
      lessonsCount: integer("lessonsCount").default(0).notNull(),
      durationMinutes: integer("durationMinutes").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      courseIdx: index("module_course_id_idx").on(table.courseId)
    }));
    courseLessons = pgTable("courseLessons", {
      id: serial("id").primaryKey(),
      moduleId: integer("moduleId").notNull(),
      courseId: integer("courseId").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      lessonType: lessonTypeEnum("lessonType").default("video").notNull(),
      videoUrl: varchar("videoUrl", { length: 500 }),
      videoDurationSeconds: integer("videoDurationSeconds"),
      content: text("content"),
      // For text lessons
      downloadUrl: varchar("downloadUrl", { length: 500 }),
      // For downloadable materials
      orderIndex: integer("orderIndex").default(0).notNull(),
      isFree: boolean("isFree").default(false).notNull(),
      // Free preview lessons
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      moduleIdx: index("lesson_module_id_idx").on(table.moduleId),
      courseIdx: index("lesson_course_id_idx").on(table.courseId)
    }));
    courseEnrollments = pgTable("courseEnrollments", {
      id: serial("id").primaryKey(),
      courseId: integer("courseId").notNull(),
      userId: integer("userId").notNull(),
      orderId: integer("orderId"),
      // Link to payment order if paid
      pricePaidCents: integer("pricePaidCents").notNull(),
      progressPercent: integer("progressPercent").default(0).notNull(),
      completedLessonsCount: integer("completedLessonsCount").default(0).notNull(),
      lastAccessedAt: timestamp("lastAccessedAt"),
      completedAt: timestamp("completedAt"),
      certificateUrl: varchar("certificateUrl", { length: 500 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      courseIdx: index("enrollment_course_id_idx").on(table.courseId),
      userIdx: index("enrollment_user_id_idx").on(table.userId),
      uniqueEnrollment: unique("unique_enrollment").on(table.courseId, table.userId)
    }));
    lessonProgress = pgTable("lessonProgress", {
      id: serial("id").primaryKey(),
      lessonId: integer("lessonId").notNull(),
      userId: integer("userId").notNull(),
      enrollmentId: integer("enrollmentId").notNull(),
      isCompleted: boolean("isCompleted").default(false).notNull(),
      watchedSeconds: integer("watchedSeconds").default(0).notNull(),
      completedAt: timestamp("completedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      lessonIdx: index("progress_lesson_id_idx").on(table.lessonId),
      userIdx: index("progress_user_id_idx").on(table.userId),
      enrollmentIdx: index("progress_enrollment_id_idx").on(table.enrollmentId),
      uniqueProgress: unique("unique_progress").on(table.lessonId, table.userId)
    }));
    courseReviews = pgTable("courseReviews", {
      id: serial("id").primaryKey(),
      courseId: integer("courseId").notNull(),
      userId: integer("userId").notNull(),
      enrollmentId: integer("enrollmentId").notNull(),
      rating: integer("rating").notNull(),
      // 1-5
      title: varchar("title", { length: 255 }),
      content: text("content"),
      isVerified: boolean("isVerified").default(false).notNull(),
      // Verified purchase
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    }, (table) => ({
      courseIdx: index("review_course_id_idx").on(table.courseId),
      userIdx: index("review_user_id_idx").on(table.userId),
      uniqueReview: unique("unique_review").on(table.courseId, table.userId)
    }));
    digitalProducts = pgTable("digitalProducts", {
      id: serial("id").primaryKey(),
      creatorId: integer("creatorId").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      slug: varchar("slug", { length: 255 }).notNull().unique(),
      description: text("description"),
      shortDescription: varchar("shortDescription", { length: 500 }),
      thumbnailUrl: varchar("thumbnailUrl", { length: 500 }),
      previewUrl: varchar("previewUrl", { length: 500 }),
      // Preview file
      fileUrl: varchar("fileUrl", { length: 500 }).notNull(),
      // Main file
      fileType: varchar("fileType", { length: 50 }).notNull(),
      // pdf, epub, etc.
      fileSizeBytes: integer("fileSizeBytes"),
      priceCents: integer("priceCents").notNull(),
      compareAtPriceCents: integer("compareAtPriceCents"),
      status: courseStatusEnum("status").default("draft").notNull(),
      salesCount: integer("salesCount").default(0).notNull(),
      averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0"),
      reviewsCount: integer("reviewsCount").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull(),
      publishedAt: timestamp("publishedAt")
    }, (table) => ({
      creatorIdx: index("digital_creator_id_idx").on(table.creatorId),
      slugIdx: index("digital_slug_idx").on(table.slug),
      statusIdx: index("digital_status_idx").on(table.status)
    }));
    digitalPurchases = pgTable("digitalPurchases", {
      id: serial("id").primaryKey(),
      productId: integer("productId").notNull(),
      userId: integer("userId").notNull(),
      orderId: integer("orderId"),
      pricePaidCents: integer("pricePaidCents").notNull(),
      downloadCount: integer("downloadCount").default(0).notNull(),
      lastDownloadedAt: timestamp("lastDownloadedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      productIdx: index("purchase_product_id_idx").on(table.productId),
      userIdx: index("purchase_user_id_idx").on(table.userId),
      uniquePurchase: unique("unique_purchase").on(table.productId, table.userId)
    }));
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: integer("userId").notNull(),
      type: varchar("type", { length: 50 }).notNull(),
      // 'like', 'comment', 'follow', 'purchase', etc.
      title: varchar("title", { length: 255 }).notNull(),
      message: text("message"),
      linkUrl: varchar("linkUrl", { length: 500 }),
      isRead: boolean("isRead").default(false).notNull(),
      metadata: json("metadata"),
      // Additional data
      createdAt: timestamp("createdAt").defaultNow().notNull()
    }, (table) => ({
      userIdx: index("notification_user_id_idx").on(table.userId),
      readIdx: index("notification_is_read_idx").on(table.isRead),
      createdAtIdx: index("notification_created_at_idx").on(table.createdAt)
    }));
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  getDb: () => getDb,
  getUserByOpenId: () => getUserByOpenId,
  upsertUser: () => upsertUser
});
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = {
      openId: user.openId
    };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    }
    if (!values.lastSignedIn) {
      values.lastSignedIn = /* @__PURE__ */ new Date();
    }
    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    }
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    _db = null;
  }
});

// api/index.ts
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

// server/supabase.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.VITE_SUPABASE_URL;
var supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}
var supabase = createClient(supabaseUrl, supabaseAnonKey);
async function getSupabaseUser(accessToken) {
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error) {
    console.error("[Supabase] Error getting user:", error);
    return null;
  }
  return data.user;
}

// server/_core/context.ts
init_db();
async function createContext(opts) {
  let user = null;
  const req = opts.req;
  const res = opts.res;
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const accessToken = authHeader.substring(7);
      const supabaseUser = await getSupabaseUser(accessToken);
      if (supabaseUser) {
        const dbUser = await getUserByOpenId(supabaseUser.id);
        if (dbUser) {
          user = dbUser;
        } else {
          await upsertUser({
            openId: supabaseUser.id,
            name: supabaseUser.user_metadata?.name || null,
            email: supabaseUser.email ?? null,
            loginMethod: supabaseUser.app_metadata?.provider ?? "email",
            lastSignedIn: /* @__PURE__ */ new Date()
          });
          user = await getUserByOpenId(supabaseUser.id) ?? null;
        }
      }
    }
  } catch (error) {
    console.error("[Auth] Error authenticating request:", error);
    user = null;
  }
  return {
    req,
    res,
    user
  };
}

// server/_core/oauth.ts
function registerOAuthRoutes(app2) {
  app2.get("/api/oauth/callback", (_req, res) => {
    res.redirect("/");
  });
}

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";

// server/_core/env.ts
var ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.VITE_SUPABASE_ANON_KEY ?? ""
};

// server/_core/notification.ts
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers-products.ts
import { z as z3 } from "zod";

// server/db-products.ts
init_db();
init_schema();
import { eq as eq2 } from "drizzle-orm";
async function getActiveProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq2(products.active, true));
}
async function getProductBySlug(slug) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq2(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getProductById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(products).where(eq2(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function createOrder(orderData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(orderData).returning({ id: orders.id });
  return result[0].id;
}
async function createOrderItems(items) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orderItems).values(items);
}
async function createAddress(addressData) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(addresses).values(addressData).returning({ id: addresses.id });
  return result[0].id;
}
async function getUserAddresses(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(addresses).where(eq2(addresses.userId, userId));
}
async function getUserOrders(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).where(eq2(orders.userId, userId));
}
async function getOrderById(orderId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(orders).where(eq2(orders.id, orderId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function getOrderItems(orderId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq2(orderItems.orderId, orderId));
}
async function updateUserProfile(userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq2(users.id, userId));
}
async function getUserById(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq2(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function updateAddress(addressId, userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(addresses).where(eq2(addresses.id, addressId)).limit(1);
  if (existing.length === 0 || existing[0].userId !== userId) {
    throw new Error("Address not found");
  }
  if (data.isDefault) {
    await db.update(addresses).set({ isDefault: false }).where(eq2(addresses.userId, userId));
  }
  await db.update(addresses).set(data).where(eq2(addresses.id, addressId));
}
async function deleteAddress(addressId, userId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(addresses).where(eq2(addresses.id, addressId)).limit(1);
  if (existing.length === 0 || existing[0].userId !== userId) {
    throw new Error("Address not found");
  }
  await db.delete(addresses).where(eq2(addresses.id, addressId));
}
async function getOrderWithTracking(orderId, userId) {
  const db = await getDb();
  if (!db) return null;
  const orderResult = await db.select().from(orders).where(eq2(orders.id, orderId)).limit(1);
  if (orderResult.length === 0 || orderResult[0].userId !== userId) {
    return null;
  }
  const order = orderResult[0];
  const items = await db.select().from(orderItems).where(eq2(orderItems.orderId, orderId));
  const shipmentResult = await db.select().from(shipments).where(eq2(shipments.orderId, orderId)).limit(1);
  return {
    ...order,
    items,
    shipment: shipmentResult.length > 0 ? shipmentResult[0] : null
  };
}
async function decrementProductStock(productId, quantity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const product = await getProductById(productId);
  if (!product) throw new Error("Product not found");
  const currentStock = product.stockQuantity ?? 0;
  if (currentStock < quantity) {
    throw new Error("Insufficient stock");
  }
  await db.update(products).set({ stockQuantity: currentStock - quantity }).where(eq2(products.id, productId));
}

// server/services/tracking.ts
var CARRIER_PATTERNS = {
  correios: /^[A-Z]{2}\d{9}[A-Z]{2}$/,
  jadlog: /^\d{14}$/,
  loggi: /^[A-Z0-9]{10,}$/
};
function detectCarrier(trackingCode) {
  for (const [carrier, pattern] of Object.entries(CARRIER_PATTERNS)) {
    if (pattern.test(trackingCode.toUpperCase())) {
      return carrier;
    }
  }
  return "unknown";
}
function getTrackingUrl(trackingCode, carrier) {
  const detectedCarrier = carrier || detectCarrier(trackingCode);
  const urls = {
    correios: `https://www.linkcorreios.com.br/?id=${trackingCode}`,
    jadlog: `https://www.jadlog.com.br/jadlog/tracking?cte=${trackingCode}`,
    loggi: `https://www.loggi.com/rastreio/${trackingCode}`,
    unknown: `https://www.google.com/search?q=rastrear+${trackingCode}`
  };
  return urls[detectedCarrier] || urls.unknown;
}
async function trackCorreios(trackingCode) {
  console.log(`[Tracking] Fetching Correios tracking for: ${trackingCode}`);
  const simulatedEvents = [
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3),
      location: "S\xE3o Paulo - SP",
      status: "posted",
      description: "Objeto postado"
    },
    {
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1e3),
      location: "S\xE3o Paulo - SP",
      status: "in_transit",
      description: "Objeto em tr\xE2nsito - por favor aguarde"
    },
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3),
      location: "Centro de Distribui\xE7\xE3o - Destino",
      status: "in_transit",
      description: "Objeto em tr\xE2nsito - por favor aguarde"
    }
  ];
  return {
    success: true,
    trackingCode,
    carrier: "correios",
    status: "in_transit",
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3),
    events: simulatedEvents
  };
}
async function trackShipment(trackingCode) {
  const carrier = detectCarrier(trackingCode);
  try {
    switch (carrier) {
      case "correios":
        return await trackCorreios(trackingCode);
      case "jadlog":
      case "loggi":
        return {
          success: true,
          trackingCode,
          carrier,
          status: "in_transit",
          events: [
            {
              date: /* @__PURE__ */ new Date(),
              location: "Em tr\xE2nsito",
              status: "in_transit",
              description: "Pacote em tr\xE2nsito para o destino"
            }
          ]
        };
      default:
        return {
          success: false,
          trackingCode,
          carrier: "unknown",
          status: "unknown",
          events: [],
          error: "Transportadora n\xE3o identificada"
        };
    }
  } catch (error) {
    console.error("[Tracking] Error:", error);
    return {
      success: false,
      trackingCode,
      carrier,
      status: "error",
      events: [],
      error: error instanceof Error ? error.message : "Erro ao rastrear"
    };
  }
}

// server/services/pagarme.ts
import { z as z2 } from "zod";
var PAGARME_API_KEY = process.env.PAGARME_API_KEY;
var PAGARME_API_URL = process.env.PAGARME_API_URL || "https://api.pagar.me/core/v5";
var creditCardSchema = z2.object({
  number: z2.string().min(13).max(19),
  holderName: z2.string().min(3),
  expMonth: z2.number().min(1).max(12),
  expYear: z2.number().min(2024),
  cvv: z2.string().length(3)
});
var customerSchema = z2.object({
  name: z2.string().min(3),
  email: z2.string().email(),
  document: z2.string().min(11).max(14),
  // CPF or CNPJ
  phone: z2.string().optional()
});
var addressSchema = z2.object({
  street: z2.string(),
  number: z2.string(),
  complement: z2.string().optional(),
  neighborhood: z2.string(),
  city: z2.string(),
  state: z2.string().length(2),
  zipCode: z2.string().length(8),
  country: z2.string().default("BR")
});
function isPagarmeConfigured() {
  return !!PAGARME_API_KEY;
}
async function pagarmeRequest(endpoint, method = "GET", body) {
  if (!PAGARME_API_KEY) {
    throw new Error("Pagar.me API key not configured");
  }
  const response = await fetch(`${PAGARME_API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${PAGARME_API_KEY}:`).toString("base64")}`
    },
    body: body ? JSON.stringify(body) : void 0
  });
  const data = await response.json();
  if (!response.ok) {
    const error = data;
    throw new Error(error.message || "Pagar.me API error");
  }
  return data;
}
async function createPixPayment(params) {
  if (!isPagarmeConfigured()) {
    console.warn("[Pagar.me] Running in simulation mode - no API key configured");
    return {
      success: true,
      transactionId: `sim_pix_${Date.now()}`,
      status: "pending",
      message: "PIX simulado - ambiente de desenvolvimento",
      pixQrCode: "00020126580014br.gov.bcb.pix0136exemplo-pix-simulado",
      pixQrCodeUrl: "https://via.placeholder.com/200x200?text=QR+Code+PIX"
    };
  }
  try {
    const response = await pagarmeRequest("/orders", "POST", {
      items: [
        {
          amount: params.amountCents,
          description: `Pedido #${params.orderId}`,
          quantity: 1,
          code: params.orderId
        }
      ],
      customer: {
        name: params.customer.name,
        email: params.customer.email,
        document: params.customer.document,
        type: params.customer.document.length > 11 ? "company" : "individual"
      },
      payments: [
        {
          payment_method: "pix",
          pix: {
            expires_in: (params.expiresInMinutes || 30) * 60
            // Convert to seconds
          }
        }
      ]
    });
    const pixCharge = response.charges?.[0]?.last_transaction;
    return {
      success: true,
      transactionId: response.id,
      status: "pending",
      message: "PIX gerado com sucesso",
      pixQrCode: pixCharge?.qr_code,
      pixQrCodeUrl: pixCharge?.qr_code_url
    };
  } catch (error) {
    console.error("[Pagar.me] PIX payment error:", error);
    return {
      success: false,
      status: "refused",
      message: error instanceof Error ? error.message : "Erro ao gerar PIX"
    };
  }
}
async function createBoletoPayment(params) {
  if (!isPagarmeConfigured()) {
    const dueDate = /* @__PURE__ */ new Date();
    dueDate.setDate(dueDate.getDate() + (params.dueDays || 3));
    console.warn("[Pagar.me] Running in simulation mode - no API key configured");
    return {
      success: true,
      transactionId: `sim_boleto_${Date.now()}`,
      status: "pending",
      message: "Boleto simulado - ambiente de desenvolvimento",
      boletoUrl: "https://via.placeholder.com/800x400?text=Boleto+Simulado",
      boletoBarcode: "23793.38128 60000.000003 00000.000400 1 84340000012345",
      boletoDueDate: dueDate.toISOString()
    };
  }
  try {
    const dueDate = /* @__PURE__ */ new Date();
    dueDate.setDate(dueDate.getDate() + (params.dueDays || 3));
    const response = await pagarmeRequest("/orders", "POST", {
      items: [
        {
          amount: params.amountCents,
          description: `Pedido #${params.orderId}`,
          quantity: 1,
          code: params.orderId
        }
      ],
      customer: {
        name: params.customer.name,
        email: params.customer.email,
        document: params.customer.document,
        type: params.customer.document.length > 11 ? "company" : "individual",
        address: {
          line_1: `${params.billingAddress.number}, ${params.billingAddress.street}`,
          line_2: params.billingAddress.complement,
          zip_code: params.billingAddress.zipCode,
          city: params.billingAddress.city,
          state: params.billingAddress.state,
          country: params.billingAddress.country
        }
      },
      payments: [
        {
          payment_method: "boleto",
          boleto: {
            due_at: dueDate.toISOString(),
            instructions: "N\xE3o receber ap\xF3s o vencimento"
          }
        }
      ]
    });
    const boletoCharge = response.charges?.[0]?.last_transaction;
    return {
      success: true,
      transactionId: response.id,
      status: "pending",
      message: "Boleto gerado com sucesso",
      boletoUrl: boletoCharge?.pdf,
      boletoBarcode: boletoCharge?.line,
      boletoDueDate: boletoCharge?.due_at
    };
  } catch (error) {
    console.error("[Pagar.me] Boleto payment error:", error);
    return {
      success: false,
      status: "refused",
      message: error instanceof Error ? error.message : "Erro ao gerar boleto"
    };
  }
}

// server/services/email.ts
var RESEND_API_KEY = process.env.RESEND_API_KEY;
var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
var EMAIL_FROM = process.env.EMAIL_FROM || "noreply@hayahlivros.com.br";
var EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || "Hayah Livros";
async function sendEmail(options) {
  if (RESEND_API_KEY) {
    return sendWithResend(options);
  }
  if (SENDGRID_API_KEY) {
    return sendWithSendGrid(options);
  }
  console.log("[Email] No provider configured. Email would be sent:");
  console.log(`  To: ${options.to}`);
  console.log(`  Subject: ${options.subject}`);
  console.log(`  Content: ${options.text || options.html.substring(0, 100)}...`);
  return {
    success: true,
    messageId: `dev_${Date.now()}`
  };
}
async function sendWithResend(options) {
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: `${EMAIL_FROM_NAME} <${EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        reply_to: options.replyTo
      })
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send email");
    }
    return {
      success: true,
      messageId: data.id
    };
  } catch (error) {
    console.error("[Email] Resend error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email"
    };
  }
}
async function sendWithSendGrid(options) {
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SENDGRID_API_KEY}`
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: { email: EMAIL_FROM, name: EMAIL_FROM_NAME },
        subject: options.subject,
        content: [
          { type: "text/plain", value: options.text || options.html.replace(/<[^>]*>/g, "") },
          { type: "text/html", value: options.html }
        ],
        reply_to: options.replyTo ? { email: options.replyTo } : void 0
      })
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.errors?.[0]?.message || "Failed to send email");
    }
    return {
      success: true,
      messageId: response.headers.get("x-message-id") || `sg_${Date.now()}`
    };
  } catch (error) {
    console.error("[Email] SendGrid error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email"
    };
  }
}
function orderConfirmationEmail(data) {
  const formatPrice = (cents) => `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
  const itemsHtml = data.items.map(
    (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${formatPrice(item.priceCents)}</td>
      </tr>
    `
  ).join("");
  const itemsText = data.items.map((item) => `  - ${item.name} x${item.quantity}: ${formatPrice(item.priceCents)}`).join("\n");
  const paymentMethodLabel = {
    credit_card: "Cart\xE3o de Cr\xE9dito",
    pix: "PIX",
    boleto: "Boleto Banc\xE1rio"
  };
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hayah Livros</h1>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <h2 style="color: #333; margin-top: 0;">Pedido Confirmado!</h2>

      <p style="color: #666; line-height: 1.6;">
        Ol\xE1 <strong>${data.customerName}</strong>,
      </p>

      <p style="color: #666; line-height: 1.6;">
        Recebemos seu pedido <strong>#${data.orderId}</strong> e ele est\xE1 sendo processado.
      </p>

      <!-- Order Items -->
      <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
        <thead>
          <tr style="background-color: #f8f8f8;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ec4899;">Produto</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ec4899;">Qtd</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ec4899;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px; text-align: right;">Subtotal:</td>
            <td style="padding: 12px; text-align: right;">${formatPrice(data.subtotalCents)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 12px; text-align: right;">Frete:</td>
            <td style="padding: 12px; text-align: right;">${formatPrice(data.shippingCents)}</td>
          </tr>
          <tr style="font-weight: bold; font-size: 18px;">
            <td colspan="2" style="padding: 12px; text-align: right; color: #ec4899;">Total:</td>
            <td style="padding: 12px; text-align: right; color: #ec4899;">${formatPrice(data.totalCents)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Shipping Address -->
      <div style="background-color: #f8f8f8; padding: 16px; border-radius: 8px; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #333;">Endere\xE7o de Entrega</h3>
        <p style="color: #666; margin: 0; line-height: 1.6;">
          ${data.shippingAddress.street}, ${data.shippingAddress.number}
          ${data.shippingAddress.complement ? ` - ${data.shippingAddress.complement}` : ""}<br>
          ${data.shippingAddress.district}<br>
          ${data.shippingAddress.city} - ${data.shippingAddress.state}<br>
          CEP: ${data.shippingAddress.cep}
        </p>
      </div>

      <!-- Payment Method -->
      <p style="color: #666; line-height: 1.6;">
        <strong>Forma de Pagamento:</strong> ${paymentMethodLabel[data.paymentMethod] || data.paymentMethod}
      </p>

      <p style="color: #666; line-height: 1.6;">
        Voc\xEA receber\xE1 atualiza\xE7\xF5es sobre o status do seu pedido por e-mail.
      </p>

      <p style="color: #666; line-height: 1.6;">
        Obrigado por comprar com a gente!
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #333; padding: 24px; text-align: center;">
      <p style="color: #999; margin: 0; font-size: 14px;">
        \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Hayah Livros. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `;
  const text2 = `
HAYAH LIVROS - Pedido Confirmado!

Ol\xE1 ${data.customerName},

Recebemos seu pedido #${data.orderId} e ele est\xE1 sendo processado.

ITENS DO PEDIDO:
${itemsText}

Subtotal: ${formatPrice(data.subtotalCents)}
Frete: ${formatPrice(data.shippingCents)}
Total: ${formatPrice(data.totalCents)}

ENDERE\xC7O DE ENTREGA:
${data.shippingAddress.street}, ${data.shippingAddress.number}${data.shippingAddress.complement ? ` - ${data.shippingAddress.complement}` : ""}
${data.shippingAddress.district}
${data.shippingAddress.city} - ${data.shippingAddress.state}
CEP: ${data.shippingAddress.cep}

Forma de Pagamento: ${paymentMethodLabel[data.paymentMethod] || data.paymentMethod}

Voc\xEA receber\xE1 atualiza\xE7\xF5es sobre o status do seu pedido por e-mail.

Obrigado por comprar com a gente!

---
Hayah Livros
  `;
  return {
    subject: `Pedido #${data.orderId} confirmado - Hayah Livros`,
    html,
    text: text2
  };
}
function orderStatusUpdateEmail(data) {
  const statusLabels = {
    PAGO: {
      label: "Pagamento Confirmado",
      description: "Seu pagamento foi confirmado e seu pedido est\xE1 sendo preparado.",
      color: "#22c55e"
    },
    EM_SEPARACAO: {
      label: "Em Separa\xE7\xE3o",
      description: "Seu pedido est\xE1 sendo preparado para envio.",
      color: "#3b82f6"
    },
    POSTADO: {
      label: "Enviado",
      description: "Seu pedido foi enviado e est\xE1 a caminho!",
      color: "#8b5cf6"
    },
    EM_TRANSITO: {
      label: "Em Tr\xE2nsito",
      description: "Seu pedido est\xE1 a caminho do destino.",
      color: "#f59e0b"
    },
    ENTREGUE: {
      label: "Entregue",
      description: "Seu pedido foi entregue. Esperamos que voc\xEA aproveite!",
      color: "#22c55e"
    },
    CANCELADO: {
      label: "Cancelado",
      description: "Seu pedido foi cancelado.",
      color: "#ef4444"
    }
  };
  const statusInfo = statusLabels[data.status] || {
    label: data.status,
    description: "O status do seu pedido foi atualizado.",
    color: "#666"
  };
  const trackingSection = data.trackingCode && data.trackingUrl ? `
      <div style="background-color: #f0f9ff; padding: 16px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #3b82f6;">
        <h3 style="margin-top: 0; color: #1e40af;">Rastreamento</h3>
        <p style="color: #666; margin: 0;">
          C\xF3digo: <strong>${data.trackingCode}</strong><br>
          <a href="${data.trackingUrl}" style="color: #3b82f6;">Clique aqui para rastrear seu pedido</a>
        </p>
      </div>
    ` : "";
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Hayah Livros</h1>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      <h2 style="color: #333; margin-top: 0;">Atualiza\xE7\xE3o do Pedido #${data.orderId}</h2>

      <p style="color: #666; line-height: 1.6;">
        Ol\xE1 <strong>${data.customerName}</strong>,
      </p>

      <div style="background-color: ${statusInfo.color}15; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid ${statusInfo.color};">
        <h3 style="margin-top: 0; color: ${statusInfo.color};">${statusInfo.label}</h3>
        <p style="color: #666; margin: 0;">${statusInfo.description}</p>
      </div>

      ${trackingSection}

      <p style="color: #666; line-height: 1.6;">
        Se tiver alguma d\xFAvida, entre em contato conosco.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #333; padding: 24px; text-align: center;">
      <p style="color: #999; margin: 0; font-size: 14px;">
        \xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Hayah Livros. Todos os direitos reservados.
      </p>
    </div>
  </div>
</body>
</html>
  `;
  const text2 = `
HAYAH LIVROS - Atualiza\xE7\xE3o do Pedido #${data.orderId}

Ol\xE1 ${data.customerName},

${statusInfo.label}
${statusInfo.description}

${data.trackingCode ? `C\xF3digo de rastreamento: ${data.trackingCode}` : ""}
${data.trackingUrl ? `Link de rastreamento: ${data.trackingUrl}` : ""}

Se tiver alguma d\xFAvida, entre em contato conosco.

---
Hayah Livros
  `;
  return {
    subject: `Pedido #${data.orderId} - ${statusInfo.label}`,
    html,
    text: text2
  };
}

// server/services/melhor-envio.ts
var MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
var MELHOR_ENVIO_URL = process.env.MELHOR_ENVIO_URL || "https://sandbox.melhorenvio.com.br";
var MELHOR_ENVIO_FROM_CEP = process.env.MELHOR_ENVIO_FROM_CEP;
var MELHOR_ENVIO_EMAIL = process.env.MELHOR_ENVIO_EMAIL;
async function calculateShipping(params) {
  if (!MELHOR_ENVIO_TOKEN || !MELHOR_ENVIO_FROM_CEP) {
    console.warn("[Melhor Envio] Credentials not configured. Returning empty options.");
    return [];
  }
  try {
    const response = await fetch(`${MELHOR_ENVIO_URL}/api/v2/me/shipment/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${MELHOR_ENVIO_TOKEN}`,
        "User-Agent": MELHOR_ENVIO_EMAIL || "contact@hayahlivros.com.br"
      },
      body: JSON.stringify({
        from: {
          postal_code: MELHOR_ENVIO_FROM_CEP
        },
        to: {
          postal_code: params.to_postal_code
        },
        products: params.items.map((item) => ({
          id: item.id,
          width: item.width,
          height: item.height,
          length: item.length,
          weight: item.weight,
          insurance_value: item.insurance_value,
          quantity: item.quantity
        }))
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Melhor Envio] API Error:", JSON.stringify(errorData, null, 2));
      throw new Error(`Melhor Envio API error: ${response.statusText}`);
    }
    const data = await response.json();
    const validOptions = (Array.isArray(data) ? data : []).filter((opt) => !opt.error);
    return validOptions;
  } catch (error) {
    console.error("[Melhor Envio] Calculation error:", error);
    throw error;
  }
}

// server/routers-products.ts
var productsRouter = router({
  list: publicProcedure.query(async () => {
    return await getActiveProducts();
  }),
  getBySlug: publicProcedure.input(z3.object({ slug: z3.string() })).query(async ({ input }) => {
    return await getProductBySlug(input.slug);
  }),
  // Creator endpoints
  myProducts: protectedProcedure.query(async ({ ctx }) => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const db = await getDb2();
    if (!db) throw new Error("Database not available");
    const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq6, desc: desc4 } = await import("drizzle-orm");
    return await db.select().from(products2).where(eq6(products2.creatorId, ctx.user.id)).orderBy(desc4(products2.createdAt));
  }),
  create: protectedProcedure.input(z3.object({
    productType: z3.enum(["physical", "digital"]),
    name: z3.string().min(1).max(255),
    description: z3.string().optional(),
    priceCents: z3.number().min(0),
    compareAtPriceCents: z3.number().min(0).optional(),
    imageUrl: z3.string().optional(),
    // Physical fields
    stockQuantity: z3.number().min(0).optional(),
    weightGrams: z3.number().min(0).optional(),
    widthCm: z3.number().min(0).optional(),
    heightCm: z3.number().min(0).optional(),
    depthCm: z3.number().min(0).optional(),
    // Digital fields
    fileUrl: z3.string().optional(),
    fileType: z3.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const db = await getDb2();
    if (!db) throw new Error("Database not available");
    const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const slug = input.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 200);
    const [product] = await db.insert(products2).values({
      creatorId: ctx.user.id,
      slug,
      ...input,
      widthCm: input.widthCm?.toString(),
      heightCm: input.heightCm?.toString(),
      depthCm: input.depthCm?.toString()
    }).returning();
    return product;
  }),
  update: protectedProcedure.input(z3.object({
    productId: z3.number(),
    name: z3.string().min(1).max(255).optional(),
    description: z3.string().optional(),
    priceCents: z3.number().min(0).optional(),
    compareAtPriceCents: z3.number().min(0).optional(),
    imageUrl: z3.string().optional(),
    // Physical fields
    stockQuantity: z3.number().min(0).optional(),
    weightGrams: z3.number().min(0).optional(),
    widthCm: z3.number().min(0).optional(),
    heightCm: z3.number().min(0).optional(),
    depthCm: z3.number().min(0).optional(),
    // Digital fields
    fileUrl: z3.string().optional(),
    fileType: z3.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const db = await getDb2();
    if (!db) throw new Error("Database not available");
    const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq6, and: and3 } = await import("drizzle-orm");
    const { productId, ...updates } = input;
    const [product] = await db.select().from(products2).where(and3(
      eq6(products2.id, productId),
      eq6(products2.creatorId, ctx.user.id)
    ));
    if (!product) {
      throw new Error("Produto n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    const [updated] = await db.update(products2).set({
      ...updates,
      widthCm: updates.widthCm?.toString(),
      heightCm: updates.heightCm?.toString(),
      depthCm: updates.depthCm?.toString(),
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq6(products2.id, productId)).returning();
    return updated;
  }),
  delete: protectedProcedure.input(z3.object({ productId: z3.number() })).mutation(async ({ input, ctx }) => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const db = await getDb2();
    if (!db) throw new Error("Database not available");
    const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq6, and: and3 } = await import("drizzle-orm");
    const [product] = await db.select().from(products2).where(and3(
      eq6(products2.id, input.productId),
      eq6(products2.creatorId, ctx.user.id)
    ));
    if (!product) {
      throw new Error("Produto n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    await db.delete(products2).where(eq6(products2.id, input.productId));
    return { success: true };
  }),
  toggleActive: protectedProcedure.input(z3.object({ productId: z3.number() })).mutation(async ({ input, ctx }) => {
    const { getDb: getDb2 } = await Promise.resolve().then(() => (init_db(), db_exports));
    const db = await getDb2();
    if (!db) throw new Error("Database not available");
    const { products: products2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
    const { eq: eq6, and: and3 } = await import("drizzle-orm");
    const [product] = await db.select().from(products2).where(and3(
      eq6(products2.id, input.productId),
      eq6(products2.creatorId, ctx.user.id)
    ));
    if (!product) {
      throw new Error("Produto n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    const [updated] = await db.update(products2).set({ active: !product.active, updatedAt: /* @__PURE__ */ new Date() }).where(eq6(products2.id, input.productId)).returning();
    return updated;
  })
});
var checkoutRouter = router({
  calculateShipping: publicProcedure.input(z3.object({
    cep: z3.string(),
    productId: z3.number(),
    quantity: z3.number()
  })).mutation(async ({ input }) => {
    const product = await getProductById(input.productId);
    if (!product) {
      throw new Error("Produto n\xE3o encontrado");
    }
    if (product.productType === "digital") {
      return {
        options: [],
        message: "Produto digital n\xE3o requer frete"
      };
    }
    const getFallbackShippingOptions = () => {
      const basePrice = 15.9 + (input.quantity - 1) * 3;
      const expressPrice = 25.9 + (input.quantity - 1) * 5;
      return {
        options: [
          {
            id: "pac",
            code: "pac",
            name: "PAC - Correios",
            price: basePrice.toFixed(2),
            priceCents: Math.round(basePrice * 100),
            delivery_time: 12,
            deliveryDays: 12
          },
          {
            id: "sedex",
            code: "sedex",
            name: "SEDEX - Correios",
            price: expressPrice.toFixed(2),
            priceCents: Math.round(expressPrice * 100),
            delivery_time: 5,
            deliveryDays: 5
          }
        ]
      };
    };
    try {
      const shippingOptions = await calculateShipping({
        to_postal_code: input.cep,
        items: [{
          id: String(product.id),
          width: Number(product.widthCm),
          height: Number(product.heightCm),
          length: Number(product.depthCm),
          weight: (product.weightGrams ?? 300) / 1e3,
          // Convert to kg
          insurance_value: product.priceCents / 100,
          // Convert to BRL
          quantity: input.quantity
        }]
      });
      if (!shippingOptions || shippingOptions.length === 0) {
        console.log("[Shipping] Using fallback shipping options");
        return getFallbackShippingOptions();
      }
      return {
        options: shippingOptions.map((opt) => ({
          id: String(opt.id),
          code: String(opt.id),
          name: opt.company.name + " - " + opt.name,
          price: opt.custom_price,
          priceCents: Math.round(parseFloat(opt.custom_price) * 100),
          delivery_time: opt.custom_delivery_time,
          deliveryDays: opt.custom_delivery_time
        }))
      };
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      console.log("[Shipping] API error, using fallback shipping options");
      return getFallbackShippingOptions();
    }
  }),
  createOrder: protectedProcedure.input(z3.object({
    productId: z3.number(),
    quantity: z3.number(),
    shippingMethod: z3.string(),
    shippingPriceCents: z3.number(),
    address: z3.object({
      recipientName: z3.string(),
      cep: z3.string(),
      street: z3.string(),
      number: z3.string(),
      complement: z3.string().optional(),
      district: z3.string(),
      city: z3.string(),
      state: z3.string()
    }),
    paymentMethod: z3.enum(["credit_card", "pix", "boleto"]),
    customerNotes: z3.string().optional()
  })).mutation(async ({ input, ctx }) => {
    const product = await getProductById(input.productId);
    if (!product) {
      throw new Error("Produto n\xE3o encontrado");
    }
    if (!product.active) {
      throw new Error("Produto n\xE3o dispon\xEDvel para venda");
    }
    await decrementProductStock(product.id, input.quantity);
    const subtotalCents = product.priceCents * input.quantity;
    const totalCents = subtotalCents + input.shippingPriceCents;
    const addressId = await createAddress({
      userId: ctx.user.id,
      ...input.address,
      isDefault: false
    });
    const orderId = await createOrder({
      userId: ctx.user.id,
      addressId,
      subtotalCents,
      shippingPriceCents: input.shippingPriceCents,
      discountCents: 0,
      totalCents,
      status: "AGUARDANDO_PAGAMENTO",
      paymentMethod: input.paymentMethod,
      shippingAddress: input.address,
      customerNotes: input.customerNotes || null,
      adminNotes: null,
      paidAt: null,
      shippedAt: null,
      deliveredAt: null,
      cancelledAt: null
    });
    await createOrderItems([{
      orderId,
      productId: product.id,
      quantity: input.quantity,
      unitPriceCents: product.priceCents,
      totalPriceCents: subtotalCents,
      productName: product.name
    }]);
    let paymentResult = null;
    const customer = {
      name: input.address.recipientName,
      email: ctx.user.email || "",
      document: ctx.user.cpf || ""
    };
    const billingAddress = {
      street: input.address.street,
      number: input.address.number,
      complement: input.address.complement,
      neighborhood: input.address.district,
      city: input.address.city,
      state: input.address.state,
      zipCode: input.address.cep.replace(/\D/g, ""),
      country: "BR"
    };
    if (input.paymentMethod === "pix") {
      paymentResult = await createPixPayment({
        amountCents: totalCents,
        customer,
        orderId: String(orderId)
      });
    } else if (input.paymentMethod === "boleto") {
      paymentResult = await createBoletoPayment({
        amountCents: totalCents,
        customer,
        billingAddress,
        orderId: String(orderId)
      });
    }
    if (ctx.user.email) {
      const emailContent = orderConfirmationEmail({
        customerName: input.address.recipientName,
        orderId,
        items: [{
          name: product.name,
          quantity: input.quantity,
          priceCents: product.priceCents * input.quantity
        }],
        subtotalCents,
        shippingCents: input.shippingPriceCents,
        totalCents,
        shippingAddress: input.address,
        paymentMethod: input.paymentMethod
      });
      sendEmail({
        to: ctx.user.email,
        ...emailContent
      }).catch((err) => {
        console.error("[Email] Failed to send order confirmation:", err);
      });
    }
    return {
      orderId,
      totalCents,
      payment: paymentResult
    };
  })
});
var ordersRouter = router({
  myOrders: protectedProcedure.query(async ({ ctx }) => {
    return await getUserOrders(ctx.user.id);
  }),
  getById: protectedProcedure.input(z3.object({ id: z3.number() })).query(async ({ input, ctx }) => {
    const order = await getOrderById(input.id);
    if (!order || order.userId !== ctx.user.id) {
      throw new Error("Pedido n\xE3o encontrado");
    }
    const items = await getOrderItems(input.id);
    return {
      ...order,
      items
    };
  }),
  // Get order with tracking information
  getWithTracking: protectedProcedure.input(z3.object({ id: z3.number() })).query(async ({ input, ctx }) => {
    const orderData = await getOrderWithTracking(input.id, ctx.user.id);
    if (!orderData) {
      throw new Error("Pedido n\xE3o encontrado");
    }
    let trackingInfo = null;
    if (orderData.shipment?.trackingCode) {
      trackingInfo = await trackShipment(orderData.shipment.trackingCode);
    }
    return {
      ...orderData,
      tracking: trackingInfo
    };
  })
});
var profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return await getUserById(ctx.user.id);
  }),
  update: protectedProcedure.input(z3.object({
    name: z3.string().min(2).optional(),
    phone: z3.string().optional(),
    cpf: z3.string().length(11).optional()
  })).mutation(async ({ input, ctx }) => {
    await updateUserProfile(ctx.user.id, input);
    return { success: true };
  })
});
var addressRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getUserAddresses(ctx.user.id);
  }),
  create: protectedProcedure.input(z3.object({
    recipientName: z3.string(),
    cep: z3.string(),
    street: z3.string(),
    number: z3.string(),
    complement: z3.string().optional(),
    district: z3.string(),
    city: z3.string(),
    state: z3.string().length(2),
    isDefault: z3.boolean().optional()
  })).mutation(async ({ input, ctx }) => {
    const addressId = await createAddress({
      userId: ctx.user.id,
      ...input,
      isDefault: input.isDefault ?? false
    });
    return { success: true, addressId };
  }),
  update: protectedProcedure.input(z3.object({
    addressId: z3.number(),
    recipientName: z3.string().optional(),
    cep: z3.string().optional(),
    street: z3.string().optional(),
    number: z3.string().optional(),
    complement: z3.string().optional(),
    district: z3.string().optional(),
    city: z3.string().optional(),
    state: z3.string().length(2).optional(),
    isDefault: z3.boolean().optional()
  })).mutation(async ({ input, ctx }) => {
    const { addressId, ...data } = input;
    await updateAddress(addressId, ctx.user.id, data);
    return { success: true };
  }),
  delete: protectedProcedure.input(z3.object({ addressId: z3.number() })).mutation(async ({ input, ctx }) => {
    await deleteAddress(input.addressId, ctx.user.id);
    return { success: true };
  })
});

// server/routers-admin.ts
import { z as z4 } from "zod";
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/db-admin.ts
init_db();
init_schema();
import { eq as eq3, desc } from "drizzle-orm";
async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders);
}
async function updateOrderStatus(orderId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = { status };
  if (status === "PAGO" && !updateData.paidAt) {
    updateData.paidAt = /* @__PURE__ */ new Date();
  } else if (status === "POSTADO" && !updateData.shippedAt) {
    updateData.shippedAt = /* @__PURE__ */ new Date();
  } else if (status === "ENTREGUE" && !updateData.deliveredAt) {
    updateData.deliveredAt = /* @__PURE__ */ new Date();
  } else if (status === "CANCELADO" && !updateData.cancelledAt) {
    updateData.cancelledAt = /* @__PURE__ */ new Date();
  }
  await db.update(orders).set(updateData).where(eq3(orders.id, orderId));
}
async function updateOrderAdminNotes(orderId, adminNotes) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ adminNotes }).where(eq3(orders.id, orderId));
}
async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(users).orderBy(desc(users.createdAt));
}
async function updateUser(userId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(users).set(data).where(eq3(users.id, userId));
}
async function getOrderWithUser(orderId) {
  const db = await getDb();
  if (!db) return null;
  const orderResult = await db.select().from(orders).where(eq3(orders.id, orderId)).limit(1);
  if (orderResult.length === 0) return null;
  const order = orderResult[0];
  const userResult = await db.select().from(users).where(eq3(users.id, order.userId)).limit(1);
  const items = await db.select().from(orderItems).where(eq3(orderItems.orderId, orderId));
  return {
    ...order,
    user: userResult.length > 0 ? userResult[0] : null,
    items
  };
}
async function getShipmentByOrderId(orderId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(shipments).where(eq3(shipments.orderId, orderId)).limit(1);
  return result.length > 0 ? result[0] : null;
}
async function updateShipmentTracking(orderId, trackingCode, trackingUrl) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getShipmentByOrderId(orderId);
  if (existing) {
    await db.update(shipments).set({
      trackingCode,
      trackingUrl,
      status: "ETIQUETA_GERADA"
    }).where(eq3(shipments.orderId, orderId));
  } else {
    const order = await db.select().from(orders).where(eq3(orders.id, orderId)).limit(1);
    if (order.length === 0) throw new Error("Order not found");
    await db.insert(shipments).values({
      orderId,
      shippingMethod: "PAC",
      shippingPriceCents: order[0].shippingPriceCents,
      trackingCode,
      trackingUrl,
      status: "ETIQUETA_GERADA"
    });
  }
}
async function updateShipmentStatus(orderId, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData = { status };
  if (status === "POSTADO") {
    updateData.postedAt = /* @__PURE__ */ new Date();
  } else if (status === "ENTREGUE") {
    updateData.deliveredAt = /* @__PURE__ */ new Date();
  }
  await db.update(shipments).set(updateData).where(eq3(shipments.orderId, orderId));
}
async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products);
}
async function updateProductStock(productId, quantity) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set({ stockQuantity: quantity }).where(eq3(products.id, productId));
}
async function updateProduct(productId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(data).where(eq3(products.id, productId));
}
async function createProduct(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values({
    ...data,
    active: true
  }).returning({ id: products.id });
  return result[0].id;
}
async function deleteProduct(productId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq3(products.id, productId));
}
async function getAllPosts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: posts.id,
    content: posts.content,
    createdAt: posts.createdAt,
    creatorName: creatorProfiles.displayName,
    creatorId: creatorProfiles.id
  }).from(posts).leftJoin(creatorProfiles, eq3(posts.creatorId, creatorProfiles.id)).orderBy(desc(posts.createdAt));
}
async function adminDeletePost(postId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(posts).where(eq3(posts.id, postId));
}
async function getAllComments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: postComments.id,
    content: postComments.content,
    createdAt: postComments.createdAt,
    postId: postComments.postId,
    userName: users.name,
    userId: users.id
  }).from(postComments).leftJoin(users, eq3(postComments.userId, users.id)).orderBy(desc(postComments.createdAt));
}
async function adminDeleteComment(commentId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(postComments).where(eq3(postComments.id, commentId));
}
async function getAllCourses() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    course: courses,
    creator: {
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName
    }
  }).from(courses).leftJoin(creatorProfiles, eq3(courses.creatorId, creatorProfiles.id)).orderBy(desc(courses.createdAt));
}
async function getAllDigitalProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    product: digitalProducts,
    creator: {
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName
    }
  }).from(digitalProducts).leftJoin(creatorProfiles, eq3(digitalProducts.creatorId, creatorProfiles.id)).orderBy(desc(digitalProducts.createdAt));
}

// server/routers-admin.ts
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({
      code: "FORBIDDEN",
      message: "Acesso negado. Apenas administradores podem acessar esta funcionalidade."
    });
  }
  return next({ ctx });
});
var adminRouter = router({
  orders: router({
    list: adminProcedure2.query(async () => {
      return await getAllOrders();
    }),
    getById: adminProcedure2.input(z4.object({ id: z4.number() })).query(async ({ input }) => {
      return await getOrderWithUser(input.id);
    }),
    updateStatus: adminProcedure2.input(z4.object({
      orderId: z4.number(),
      status: z4.enum([
        "AGUARDANDO_PAGAMENTO",
        "PAGO",
        "EM_SEPARACAO",
        "POSTADO",
        "EM_TRANSITO",
        "ENTREGUE",
        "CANCELADO",
        "REEMBOLSADO"
      ])
    })).mutation(async ({ input }) => {
      await updateOrderStatus(input.orderId, input.status);
      return { success: true };
    }),
    updateNotes: adminProcedure2.input(z4.object({
      orderId: z4.number(),
      adminNotes: z4.string()
    })).mutation(async ({ input }) => {
      await updateOrderAdminNotes(input.orderId, input.adminNotes);
      return { success: true };
    })
  }),
  users: router({
    list: adminProcedure2.query(async () => {
      return await getAllUsers();
    }),
    update: adminProcedure2.input(z4.object({
      userId: z4.number(),
      role: z4.enum(["user", "admin"]).optional(),
      active: z4.boolean().optional()
    })).mutation(async ({ input }) => {
      const { userId, ...data } = input;
      await updateUser(userId, data);
      return { success: true };
    })
  }),
  // Shipment/Tracking Management
  shipments: router({
    getByOrderId: adminProcedure2.input(z4.object({ orderId: z4.number() })).query(async ({ input }) => {
      return await getShipmentByOrderId(input.orderId);
    }),
    addTracking: adminProcedure2.input(z4.object({
      orderId: z4.number(),
      trackingCode: z4.string().min(1)
    })).mutation(async ({ input }) => {
      const trackingUrl = getTrackingUrl(input.trackingCode);
      await updateShipmentTracking(input.orderId, input.trackingCode, trackingUrl);
      await updateOrderStatus(input.orderId, "POSTADO");
      const orderData = await getOrderWithUser(input.orderId);
      if (orderData?.user?.email) {
        const emailContent = orderStatusUpdateEmail({
          customerName: orderData.user.name || "Cliente",
          orderId: input.orderId,
          status: "POSTADO",
          trackingCode: input.trackingCode,
          trackingUrl
        });
        sendEmail({
          to: orderData.user.email,
          ...emailContent
        }).catch((err) => {
          console.error("[Email] Failed to send tracking notification:", err);
        });
      }
      return { success: true, trackingUrl };
    }),
    updateStatus: adminProcedure2.input(z4.object({
      orderId: z4.number(),
      status: z4.enum([
        "PENDENTE",
        "ETIQUETA_GERADA",
        "POSTADO",
        "EM_TRANSITO",
        "SAIU_PARA_ENTREGA",
        "ENTREGUE",
        "DEVOLVIDO"
      ])
    })).mutation(async ({ input }) => {
      await updateShipmentStatus(input.orderId, input.status);
      if (input.status === "ENTREGUE") {
        await updateOrderStatus(input.orderId, "ENTREGUE");
      }
      return { success: true };
    }),
    track: adminProcedure2.input(z4.object({ trackingCode: z4.string() })).query(async ({ input }) => {
      return await trackShipment(input.trackingCode);
    })
  }),
  // Product/Stock Management
  products: router({
    list: adminProcedure2.query(async () => {
      return await getAllProducts();
    }),
    updateStock: adminProcedure2.input(z4.object({
      productId: z4.number(),
      quantity: z4.number().min(0)
    })).mutation(async ({ input }) => {
      await updateProductStock(input.productId, input.quantity);
      return { success: true };
    }),
    update: adminProcedure2.input(z4.object({
      productId: z4.number(),
      name: z4.string().optional(),
      description: z4.string().optional(),
      priceCents: z4.number().optional(),
      compareAtPriceCents: z4.number().nullable().optional(),
      stockQuantity: z4.number().optional(),
      active: z4.boolean().optional(),
      imageUrl: z4.string().nullable().optional()
    })).mutation(async ({ input }) => {
      const { productId, ...data } = input;
      await updateProduct(productId, data);
      return { success: true };
    }),
    create: adminProcedure2.input(z4.object({
      name: z4.string(),
      slug: z4.string(),
      description: z4.string().optional(),
      priceCents: z4.number(),
      compareAtPriceCents: z4.number().optional(),
      stockQuantity: z4.number().optional(),
      imageUrl: z4.string().optional()
    })).mutation(async ({ input }) => {
      const productId = await createProduct(input);
      return { success: true, productId };
    }),
    delete: adminProcedure2.input(z4.object({ productId: z4.number() })).mutation(async ({ input }) => {
      await deleteProduct(input.productId);
      return { success: true };
    })
  }),
  // Social Moderation
  social: router({
    listPosts: adminProcedure2.query(async () => {
      return await getAllPosts();
    }),
    deletePost: adminProcedure2.input(z4.object({ postId: z4.number() })).mutation(async ({ input }) => {
      await adminDeletePost(input.postId);
      return { success: true };
    }),
    listComments: adminProcedure2.query(async () => {
      return await getAllComments();
    }),
    deleteComment: adminProcedure2.input(z4.object({ commentId: z4.number() })).mutation(async ({ input }) => {
      await adminDeleteComment(input.commentId);
      return { success: true };
    })
  }),
  // Marketplace Management (Admin View)
  courses: router({
    list: adminProcedure2.query(async () => {
      return await getAllCourses();
    })
  }),
  digitalProducts: router({
    list: adminProcedure2.query(async () => {
      return await getAllDigitalProducts();
    })
  })
});

// server/routers-social.ts
import { z as z5 } from "zod";

// server/db-social.ts
init_db();
init_schema();
import { eq as eq4, desc as desc2, and, sql, inArray } from "drizzle-orm";
async function getCreatorProfileByUserId(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(creatorProfiles).where(eq4(creatorProfiles.userId, userId)).limit(1);
  return result[0] || null;
}
async function getCreatorProfileById(id) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    profile: creatorProfiles,
    user: {
      id: users.id,
      name: users.name,
      email: users.email
    }
  }).from(creatorProfiles).leftJoin(users, eq4(creatorProfiles.userId, users.id)).where(eq4(creatorProfiles.id, id)).limit(1);
  return result[0] || null;
}
async function createCreatorProfile(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(creatorProfiles).values(data).returning({ id: creatorProfiles.id });
  return result[0].id;
}
async function updateCreatorProfile(userId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(creatorProfiles).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq4(creatorProfiles.userId, userId));
}
async function getApprovedCreators(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    profile: creatorProfiles,
    user: {
      id: users.id,
      name: users.name
    }
  }).from(creatorProfiles).leftJoin(users, eq4(creatorProfiles.userId, users.id)).where(eq4(creatorProfiles.status, "approved")).orderBy(desc2(creatorProfiles.followersCount)).limit(limit).offset(offset);
}
async function followUser(followerId, followingId) {
  const db = await getDb();
  if (!db) return;
  await db.insert(followers).values({ followerId, followingId });
  await db.update(creatorProfiles).set({
    followersCount: sql`${creatorProfiles.followersCount} + 1`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(creatorProfiles.userId, followingId));
}
async function unfollowUser(followerId, followingId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(followers).where(
    and(
      eq4(followers.followerId, followerId),
      eq4(followers.followingId, followingId)
    )
  );
  await db.update(creatorProfiles).set({
    followersCount: sql`GREATEST(${creatorProfiles.followersCount} - 1, 0)`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(creatorProfiles.userId, followingId));
}
async function isFollowing(followerId, followingId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(followers).where(
    and(
      eq4(followers.followerId, followerId),
      eq4(followers.followingId, followingId)
    )
  ).limit(1);
  return result.length > 0;
}
async function getFollowers(userId, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    id: users.id,
    name: users.name,
    followedAt: followers.createdAt
  }).from(followers).innerJoin(users, eq4(followers.followerId, users.id)).where(eq4(followers.followingId, userId)).orderBy(desc2(followers.createdAt)).limit(limit).offset(offset);
}
async function getFollowing(userId, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    profile: creatorProfiles,
    user: {
      id: users.id,
      name: users.name
    },
    followedAt: followers.createdAt
  }).from(followers).innerJoin(users, eq4(followers.followingId, users.id)).leftJoin(creatorProfiles, eq4(creatorProfiles.userId, users.id)).where(eq4(followers.followerId, userId)).orderBy(desc2(followers.createdAt)).limit(limit).offset(offset);
}
async function createPost(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(posts).values(data).returning({ id: posts.id });
  await db.update(creatorProfiles).set({
    postsCount: sql`${creatorProfiles.postsCount} + 1`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(creatorProfiles.id, data.creatorId));
  return result[0].id;
}
async function addPostMedia(data) {
  if (data.length === 0) return;
  const db = await getDb();
  if (!db) return;
  await db.insert(postMedia).values(data);
}
async function getPostById(postId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(posts).where(eq4(posts.id, postId)).limit(1);
  return result[0] || null;
}
async function getPostWithDetails(postId, currentUserId) {
  const db = await getDb();
  if (!db) return null;
  const post = await db.select({
    post: posts,
    creator: {
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName,
      avatarUrl: creatorProfiles.avatarUrl,
      userId: creatorProfiles.userId
    }
  }).from(posts).innerJoin(creatorProfiles, eq4(posts.creatorId, creatorProfiles.id)).where(eq4(posts.id, postId)).limit(1);
  if (!post[0]) return null;
  const media = await db.select().from(postMedia).where(eq4(postMedia.postId, postId)).orderBy(postMedia.orderIndex);
  let isLiked = false;
  if (currentUserId) {
    const like = await db.select().from(postLikes).where(and(eq4(postLikes.postId, postId), eq4(postLikes.userId, currentUserId))).limit(1);
    isLiked = like.length > 0;
  }
  return {
    ...post[0],
    media,
    isLiked
  };
}
async function getFeedPosts(currentUserId, limit = 20, offset = 0, feedType = "all") {
  const db = await getDb();
  if (!db) return [];
  let postsResult;
  if (feedType === "following") {
    const followedUserIds = db.select({ id: followers.followingId }).from(followers).where(eq4(followers.followerId, currentUserId));
    postsResult = await db.select({
      post: posts,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
        avatarUrl: creatorProfiles.avatarUrl,
        userId: creatorProfiles.userId
      }
    }).from(posts).innerJoin(creatorProfiles, eq4(posts.creatorId, creatorProfiles.id)).where(
      and(
        eq4(posts.visibility, "public"),
        inArray(creatorProfiles.userId, followedUserIds)
      )
    ).orderBy(desc2(posts.createdAt)).limit(limit).offset(offset);
  } else {
    postsResult = await db.select({
      post: posts,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
        avatarUrl: creatorProfiles.avatarUrl,
        userId: creatorProfiles.userId
      }
    }).from(posts).innerJoin(creatorProfiles, eq4(posts.creatorId, creatorProfiles.id)).where(eq4(posts.visibility, "public")).orderBy(desc2(posts.createdAt)).limit(limit).offset(offset);
  }
  const postsWithDetails = await Promise.all(
    postsResult.map(async (item) => {
      const media = await db.select().from(postMedia).where(eq4(postMedia.postId, item.post.id)).orderBy(postMedia.orderIndex);
      const like = await db.select().from(postLikes).where(
        and(
          eq4(postLikes.postId, item.post.id),
          eq4(postLikes.userId, currentUserId)
        )
      ).limit(1);
      return {
        ...item,
        media,
        isLiked: like.length > 0
      };
    })
  );
  return postsWithDetails;
}
async function getCreatorPosts(creatorId, currentUserId, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  const postsResult = await db.select({
    post: posts,
    creator: {
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName,
      avatarUrl: creatorProfiles.avatarUrl,
      userId: creatorProfiles.userId
    }
  }).from(posts).innerJoin(creatorProfiles, eq4(posts.creatorId, creatorProfiles.id)).where(eq4(posts.creatorId, creatorId)).orderBy(desc2(posts.isPinned), desc2(posts.createdAt)).limit(limit).offset(offset);
  const postsWithDetails = await Promise.all(
    postsResult.map(async (item) => {
      const media = await db.select().from(postMedia).where(eq4(postMedia.postId, item.post.id)).orderBy(postMedia.orderIndex);
      let isLiked = false;
      if (currentUserId) {
        const like = await db.select().from(postLikes).where(
          and(
            eq4(postLikes.postId, item.post.id),
            eq4(postLikes.userId, currentUserId)
          )
        ).limit(1);
        isLiked = like.length > 0;
      }
      return {
        ...item,
        media,
        isLiked
      };
    })
  );
  return postsWithDetails;
}
async function deletePost(postId, creatorId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(postMedia).where(eq4(postMedia.postId, postId));
  await db.delete(postLikes).where(eq4(postLikes.postId, postId));
  const comments = await db.select({ id: postComments.id }).from(postComments).where(eq4(postComments.postId, postId));
  if (comments.length > 0) {
    await db.delete(commentLikes).where(inArray(commentLikes.commentId, comments.map((c) => c.id)));
    await db.delete(postComments).where(eq4(postComments.postId, postId));
  }
  await db.delete(posts).where(eq4(posts.id, postId));
  await db.update(creatorProfiles).set({
    postsCount: sql`GREATEST(${creatorProfiles.postsCount} - 1, 0)`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(creatorProfiles.id, creatorId));
}
async function updatePost(postId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(posts).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq4(posts.id, postId));
}
async function likePost(postId, userId) {
  const db = await getDb();
  if (!db) return;
  await db.insert(postLikes).values({ postId, userId });
  await db.update(posts).set({
    likesCount: sql`${posts.likesCount} + 1`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(posts.id, postId));
}
async function unlikePost(postId, userId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(postLikes).where(and(eq4(postLikes.postId, postId), eq4(postLikes.userId, userId)));
  await db.update(posts).set({
    likesCount: sql`GREATEST(${posts.likesCount} - 1, 0)`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(posts.id, postId));
}
async function hasLikedPost(postId, userId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(postLikes).where(and(eq4(postLikes.postId, postId), eq4(postLikes.userId, userId))).limit(1);
  return result.length > 0;
}
async function createComment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(postComments).values(data).returning({ id: postComments.id });
  await db.update(posts).set({
    commentsCount: sql`${posts.commentsCount} + 1`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(posts.id, data.postId));
  return result[0].id;
}
async function getPostComments(postId, currentUserId, limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  const commentsResult = await db.select({
    comment: postComments,
    user: {
      id: users.id,
      name: users.name
    }
  }).from(postComments).innerJoin(users, eq4(postComments.userId, users.id)).where(eq4(postComments.postId, postId)).orderBy(desc2(postComments.createdAt)).limit(limit).offset(offset);
  const commentsWithLikes = await Promise.all(
    commentsResult.map(async (item) => {
      let isLiked = false;
      if (currentUserId) {
        const like = await db.select().from(commentLikes).where(
          and(
            eq4(commentLikes.commentId, item.comment.id),
            eq4(commentLikes.userId, currentUserId)
          )
        ).limit(1);
        isLiked = like.length > 0;
      }
      return { ...item, isLiked };
    })
  );
  return commentsWithLikes;
}
async function deleteComment(commentId, postId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(commentLikes).where(eq4(commentLikes.commentId, commentId));
  await db.delete(postComments).where(eq4(postComments.id, commentId));
  await db.update(posts).set({
    commentsCount: sql`GREATEST(${posts.commentsCount} - 1, 0)`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(posts.id, postId));
}
async function likeComment(commentId, userId) {
  const db = await getDb();
  if (!db) return;
  await db.insert(commentLikes).values({ commentId, userId });
  await db.update(postComments).set({
    likesCount: sql`${postComments.likesCount} + 1`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(postComments.id, commentId));
}
async function unlikeComment(commentId, userId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(commentLikes).where(
    and(
      eq4(commentLikes.commentId, commentId),
      eq4(commentLikes.userId, userId)
    )
  );
  await db.update(postComments).set({
    likesCount: sql`GREATEST(${postComments.likesCount} - 1, 0)`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq4(postComments.id, commentId));
}
async function createNotification(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(notifications).values(data);
}
async function getUserNotifications(userId, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq4(notifications.userId, userId)).orderBy(desc2(notifications.createdAt)).limit(limit).offset(offset);
}
async function markNotificationAsRead(notificationId, userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(
    and(
      eq4(notifications.id, notificationId),
      eq4(notifications.userId, userId)
    )
  );
}
async function markAllNotificationsAsRead(userId) {
  const db = await getDb();
  if (!db) return;
  await db.update(notifications).set({ isRead: true }).where(eq4(notifications.userId, userId));
}
async function getUnreadNotificationsCount(userId) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql`count(*)` }).from(notifications).where(
    and(eq4(notifications.userId, userId), eq4(notifications.isRead, false))
  );
  return result[0]?.count || 0;
}

// server/routers-social.ts
var creatorRouter = router({
  // Get current user's creator profile
  myProfile: protectedProcedure.query(async ({ ctx }) => {
    return await getCreatorProfileByUserId(ctx.user.id);
  }),
  // Get creator profile by ID
  getById: publicProcedure.input(z5.object({ id: z5.number() })).query(async ({ input }) => {
    return await getCreatorProfileById(input.id);
  }),
  // Create creator profile
  create: protectedProcedure.input(
    z5.object({
      displayName: z5.string().min(2).max(100),
      bio: z5.string().max(500).optional(),
      instagram: z5.string().max(100).optional(),
      youtube: z5.string().max(100).optional(),
      website: z5.string().max(255).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const existing = await getCreatorProfileByUserId(ctx.user.id);
    if (existing) {
      throw new Error("Voc\xEA j\xE1 possui um perfil de criadora");
    }
    const profileId = await createCreatorProfile({
      userId: ctx.user.id,
      ...input,
      status: "approved"
      // Auto-approve for now
    });
    return { success: true, profileId };
  }),
  // Update creator profile
  update: protectedProcedure.input(
    z5.object({
      displayName: z5.string().min(2).max(100).optional(),
      bio: z5.string().max(500).optional(),
      avatarUrl: z5.string().max(500).optional(),
      coverUrl: z5.string().max(500).optional(),
      instagram: z5.string().max(100).optional(),
      youtube: z5.string().max(100).optional(),
      website: z5.string().max(255).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    await updateCreatorProfile(ctx.user.id, input);
    return { success: true };
  }),
  // List approved creators
  list: publicProcedure.input(
    z5.object({
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    return await getApprovedCreators(input.limit, input.offset);
  })
});
var followersRouter = router({
  // Follow a creator
  follow: protectedProcedure.input(z5.object({ userId: z5.number() })).mutation(async ({ input, ctx }) => {
    if (input.userId === ctx.user.id) {
      throw new Error("Voc\xEA n\xE3o pode seguir a si mesma");
    }
    const alreadyFollowing = await isFollowing(ctx.user.id, input.userId);
    if (alreadyFollowing) {
      throw new Error("Voc\xEA j\xE1 segue esta criadora");
    }
    await followUser(ctx.user.id, input.userId);
    await createNotification({
      userId: input.userId,
      type: "follow",
      title: "Nova seguidora",
      message: `${ctx.user.name || "Algu\xE9m"} come\xE7ou a seguir voc\xEA`,
      linkUrl: `/comunidade/perfil/${ctx.user.id}`
    });
    return { success: true };
  }),
  // Unfollow a creator
  unfollow: protectedProcedure.input(z5.object({ userId: z5.number() })).mutation(async ({ input, ctx }) => {
    await unfollowUser(ctx.user.id, input.userId);
    return { success: true };
  }),
  // Check if following
  isFollowing: protectedProcedure.input(z5.object({ userId: z5.number() })).query(async ({ input, ctx }) => {
    return await isFollowing(ctx.user.id, input.userId);
  }),
  // Get followers list
  followers: publicProcedure.input(
    z5.object({
      userId: z5.number(),
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    return await getFollowers(input.userId, input.limit, input.offset);
  }),
  // Get following list
  following: publicProcedure.input(
    z5.object({
      userId: z5.number(),
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    return await getFollowing(input.userId, input.limit, input.offset);
  })
});
var postsRouter = router({
  // Create a new post
  create: protectedProcedure.input(
    z5.object({
      content: z5.string().max(5e3).optional(),
      visibility: z5.enum(["public", "followers", "private"]).default("public"),
      media: z5.array(
        z5.object({
          mediaUrl: z5.string(),
          mediaType: z5.enum(["image", "video"]),
          thumbnailUrl: z5.string().optional()
        })
      ).max(10).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Voc\xEA precisa criar um perfil de criadora primeiro");
    }
    if (profile.status !== "approved") {
      throw new Error("Seu perfil ainda n\xE3o foi aprovado");
    }
    const postId = await createPost({
      creatorId: profile.id,
      content: input.content,
      visibility: input.visibility
    });
    if (input.media && input.media.length > 0) {
      await addPostMedia(
        input.media.map((m, index2) => ({
          postId,
          mediaUrl: m.mediaUrl,
          mediaType: m.mediaType,
          thumbnailUrl: m.thumbnailUrl,
          orderIndex: index2
        }))
      );
    }
    return { success: true, postId };
  }),
  // Get post by ID
  getById: publicProcedure.input(z5.object({ id: z5.number() })).query(async ({ input, ctx }) => {
    return await getPostWithDetails(input.id, ctx.user?.id);
  }),
  // Get feed posts
  feed: protectedProcedure.input(
    z5.object({
      type: z5.enum(["all", "following"]).default("all"),
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input, ctx }) => {
    return await getFeedPosts(ctx.user.id, input.limit, input.offset, input.type);
  }),
  // Get creator's posts
  byCreator: publicProcedure.input(
    z5.object({
      creatorId: z5.number(),
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input, ctx }) => {
    return await getCreatorPosts(input.creatorId, ctx.user?.id, input.limit, input.offset);
  }),
  // Update post
  update: protectedProcedure.input(
    z5.object({
      postId: z5.number(),
      content: z5.string().max(5e3).optional(),
      visibility: z5.enum(["public", "followers", "private"]).optional(),
      isPinned: z5.boolean().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const post = await getPostById(input.postId);
    if (!post || post.creatorId !== profile.id) {
      throw new Error("Post n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    const { postId, ...data } = input;
    await updatePost(postId, data);
    return { success: true };
  }),
  // Delete post
  delete: protectedProcedure.input(z5.object({ postId: z5.number() })).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const post = await getPostById(input.postId);
    if (!post || post.creatorId !== profile.id) {
      throw new Error("Post n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    await deletePost(input.postId, profile.id);
    return { success: true };
  })
});
var likesRouter = router({
  // Like a post
  like: protectedProcedure.input(z5.object({ postId: z5.number() })).mutation(async ({ input, ctx }) => {
    const alreadyLiked = await hasLikedPost(input.postId, ctx.user.id);
    if (alreadyLiked) {
      throw new Error("Voc\xEA j\xE1 curtiu este post");
    }
    await likePost(input.postId, ctx.user.id);
    const post = await getPostWithDetails(input.postId);
    if (post && post.creator.userId !== ctx.user.id) {
      await createNotification({
        userId: post.creator.userId,
        type: "like",
        title: "Nova curtida",
        message: `${ctx.user.name || "Algu\xE9m"} curtiu seu post`,
        linkUrl: `/comunidade/post/${input.postId}`
      });
    }
    return { success: true };
  }),
  // Unlike a post
  unlike: protectedProcedure.input(z5.object({ postId: z5.number() })).mutation(async ({ input, ctx }) => {
    await unlikePost(input.postId, ctx.user.id);
    return { success: true };
  }),
  // Like a comment
  likeComment: protectedProcedure.input(z5.object({ commentId: z5.number() })).mutation(async ({ input, ctx }) => {
    await likeComment(input.commentId, ctx.user.id);
    return { success: true };
  }),
  // Unlike a comment
  unlikeComment: protectedProcedure.input(z5.object({ commentId: z5.number() })).mutation(async ({ input, ctx }) => {
    await unlikeComment(input.commentId, ctx.user.id);
    return { success: true };
  })
});
var commentsRouter = router({
  // Create comment
  create: protectedProcedure.input(
    z5.object({
      postId: z5.number(),
      content: z5.string().min(1).max(2e3),
      parentId: z5.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const commentId = await createComment({
      postId: input.postId,
      userId: ctx.user.id,
      content: input.content,
      parentId: input.parentId
    });
    const post = await getPostWithDetails(input.postId);
    if (post && post.creator.userId !== ctx.user.id) {
      await createNotification({
        userId: post.creator.userId,
        type: "comment",
        title: "Novo coment\xE1rio",
        message: `${ctx.user.name || "Algu\xE9m"} comentou no seu post`,
        linkUrl: `/comunidade/post/${input.postId}`
      });
    }
    return { success: true, commentId };
  }),
  // Get comments for a post
  list: publicProcedure.input(
    z5.object({
      postId: z5.number(),
      limit: z5.number().min(1).max(100).default(50),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input, ctx }) => {
    return await getPostComments(input.postId, ctx.user?.id, input.limit, input.offset);
  }),
  // Delete comment
  delete: protectedProcedure.input(z5.object({ commentId: z5.number(), postId: z5.number() })).mutation(async ({ input, ctx }) => {
    await deleteComment(input.commentId, input.postId);
    return { success: true };
  })
});
var notificationsRouter = router({
  // Get user notifications
  list: protectedProcedure.input(
    z5.object({
      limit: z5.number().min(1).max(50).default(20),
      offset: z5.number().min(0).default(0)
    })
  ).query(async ({ input, ctx }) => {
    return await getUserNotifications(ctx.user.id, input.limit, input.offset);
  }),
  // Get unread count
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await getUnreadNotificationsCount(ctx.user.id);
  }),
  // Mark as read
  markAsRead: protectedProcedure.input(z5.object({ notificationId: z5.number() })).mutation(async ({ input, ctx }) => {
    await markNotificationAsRead(input.notificationId, ctx.user.id);
    return { success: true };
  }),
  // Mark all as read
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await markAllNotificationsAsRead(ctx.user.id);
    return { success: true };
  })
});
var socialRouter = router({
  creator: creatorRouter,
  followers: followersRouter,
  posts: postsRouter,
  likes: likesRouter,
  comments: commentsRouter,
  notifications: notificationsRouter
});

// server/routers-courses.ts
import { z as z6 } from "zod";

// server/db-courses.ts
init_db();
init_schema();
import { eq as eq5, desc as desc3, and as and2, sql as sql2, inArray as inArray2, asc } from "drizzle-orm";
async function createCourse(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(courses).values(data).returning({ id: courses.id });
  await db.update(creatorProfiles).set({
    coursesCount: sql2`${creatorProfiles.coursesCount} + 1`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq5(creatorProfiles.id, data.creatorId));
  return result[0].id;
}
async function updateCourse(courseId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(courses).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(courses.id, courseId));
}
async function getCourseById(courseId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(courses).where(eq5(courses.id, courseId)).limit(1);
  return result[0] || null;
}
async function getCourseBySlug(slug) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    course: courses,
    creator: {
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName,
      avatarUrl: creatorProfiles.avatarUrl,
      userId: creatorProfiles.userId
    }
  }).from(courses).innerJoin(creatorProfiles, eq5(courses.creatorId, creatorProfiles.id)).where(eq5(courses.slug, slug)).limit(1);
  return result[0] || null;
}
async function getCourseWithModules(courseId) {
  const db = await getDb();
  if (!db) return null;
  const course = await getCourseById(courseId);
  if (!course) return null;
  const modules = await db.select().from(courseModules).where(eq5(courseModules.courseId, courseId)).orderBy(asc(courseModules.orderIndex));
  const modulesWithLessons = await Promise.all(
    modules.map(async (module) => {
      const lessons = await db.select().from(courseLessons).where(eq5(courseLessons.moduleId, module.id)).orderBy(asc(courseLessons.orderIndex));
      return { ...module, lessons };
    })
  );
  return { ...course, modules: modulesWithLessons };
}
async function getPublishedCourses(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    course: courses,
    creator: {
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName,
      avatarUrl: creatorProfiles.avatarUrl
    }
  }).from(courses).innerJoin(creatorProfiles, eq5(courses.creatorId, creatorProfiles.id)).where(eq5(courses.status, "published")).orderBy(desc3(courses.createdAt)).limit(limit).offset(offset);
}
async function getFeaturedCourses(limit = 6) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    course: courses,
    creator: {
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName,
      avatarUrl: creatorProfiles.avatarUrl
    }
  }).from(courses).innerJoin(creatorProfiles, eq5(courses.creatorId, creatorProfiles.id)).where(and2(eq5(courses.status, "published"), eq5(courses.isFeatured, true))).orderBy(desc3(courses.studentsCount)).limit(limit);
}
async function getCreatorCourses(creatorId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(courses).where(eq5(courses.creatorId, creatorId)).orderBy(desc3(courses.createdAt));
}
async function deleteCourse(courseId, creatorId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const modules = await db.select({ id: courseModules.id }).from(courseModules).where(eq5(courseModules.courseId, courseId));
  if (modules.length > 0) {
    const moduleIds = modules.map((m) => m.id);
    const lessons = await db.select({ id: courseLessons.id }).from(courseLessons).where(inArray2(courseLessons.moduleId, moduleIds));
    if (lessons.length > 0) {
      await db.delete(lessonProgress).where(inArray2(lessonProgress.lessonId, lessons.map((l) => l.id)));
    }
    await db.delete(courseLessons).where(inArray2(courseLessons.moduleId, moduleIds));
    await db.delete(courseModules).where(eq5(courseModules.courseId, courseId));
  }
  await db.delete(courseEnrollments).where(eq5(courseEnrollments.courseId, courseId));
  await db.delete(courseReviews).where(eq5(courseReviews.courseId, courseId));
  await db.delete(courses).where(eq5(courses.id, courseId));
  await db.update(creatorProfiles).set({
    coursesCount: sql2`GREATEST(${creatorProfiles.coursesCount} - 1, 0)`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq5(creatorProfiles.id, creatorId));
}
async function createModule(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(courseModules).values(data).returning({ id: courseModules.id });
  return result[0].id;
}
async function updateModule(moduleId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(courseModules).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(courseModules.id, moduleId));
}
async function getModuleById(moduleId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(courseModules).where(eq5(courseModules.id, moduleId)).limit(1);
  return result[0] || null;
}
async function deleteModule(moduleId, courseId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const lessons = await db.select({ id: courseLessons.id }).from(courseLessons).where(eq5(courseLessons.moduleId, moduleId));
  if (lessons.length > 0) {
    await db.delete(lessonProgress).where(inArray2(lessonProgress.lessonId, lessons.map((l) => l.id)));
    await db.delete(courseLessons).where(eq5(courseLessons.moduleId, moduleId));
  }
  await db.delete(courseModules).where(eq5(courseModules.id, moduleId));
  await updateCourseLessonCount(courseId);
}
async function reorderModules(courseId, moduleIds) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (let i = 0; i < moduleIds.length; i++) {
    await db.update(courseModules).set({ orderIndex: i, updatedAt: /* @__PURE__ */ new Date() }).where(
      and2(
        eq5(courseModules.id, moduleIds[i]),
        eq5(courseModules.courseId, courseId)
      )
    );
  }
}
async function createLesson(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(courseLessons).values(data).returning({ id: courseLessons.id });
  await updateModuleLessonCount(data.moduleId);
  await updateCourseLessonCount(data.courseId);
  return result[0].id;
}
async function updateLesson(lessonId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(courseLessons).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(courseLessons.id, lessonId));
}
async function getLessonById(lessonId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(courseLessons).where(eq5(courseLessons.id, lessonId)).limit(1);
  return result[0] || null;
}
async function deleteLesson(lessonId, moduleId, courseId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(lessonProgress).where(eq5(lessonProgress.lessonId, lessonId));
  await db.delete(courseLessons).where(eq5(courseLessons.id, lessonId));
  await updateModuleLessonCount(moduleId);
  await updateCourseLessonCount(courseId);
}
async function reorderLessons(moduleId, lessonIds) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  for (let i = 0; i < lessonIds.length; i++) {
    await db.update(courseLessons).set({ orderIndex: i, updatedAt: /* @__PURE__ */ new Date() }).where(
      and2(
        eq5(courseLessons.id, lessonIds[i]),
        eq5(courseLessons.moduleId, moduleId)
      )
    );
  }
}
async function updateModuleLessonCount(moduleId) {
  const db = await getDb();
  if (!db) return;
  const lessons = await db.select({
    count: sql2`count(*)`,
    duration: sql2`COALESCE(SUM(${courseLessons.videoDurationSeconds}), 0)`
  }).from(courseLessons).where(eq5(courseLessons.moduleId, moduleId));
  await db.update(courseModules).set({
    lessonsCount: lessons[0]?.count || 0,
    durationMinutes: Math.ceil((lessons[0]?.duration || 0) / 60),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq5(courseModules.id, moduleId));
}
async function updateCourseLessonCount(courseId) {
  const db = await getDb();
  if (!db) return;
  const lessons = await db.select({
    count: sql2`count(*)`,
    duration: sql2`COALESCE(SUM(${courseLessons.videoDurationSeconds}), 0)`
  }).from(courseLessons).where(eq5(courseLessons.courseId, courseId));
  await db.update(courses).set({
    lessonsCount: lessons[0]?.count || 0,
    totalDurationMinutes: Math.ceil((lessons[0]?.duration || 0) / 60),
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq5(courses.id, courseId));
}
async function createEnrollment(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(courseEnrollments).values(data).returning({ id: courseEnrollments.id });
  await db.update(courses).set({
    studentsCount: sql2`${courses.studentsCount} + 1`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq5(courses.id, data.courseId));
  return result[0].id;
}
async function getEnrollment(courseId, userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(courseEnrollments).where(
    and2(
      eq5(courseEnrollments.courseId, courseId),
      eq5(courseEnrollments.userId, userId)
    )
  ).limit(1);
  return result[0] || null;
}
async function getUserEnrollments(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    enrollment: courseEnrollments,
    course: courses,
    creator: {
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName,
      avatarUrl: creatorProfiles.avatarUrl
    }
  }).from(courseEnrollments).innerJoin(courses, eq5(courseEnrollments.courseId, courses.id)).innerJoin(creatorProfiles, eq5(courses.creatorId, creatorProfiles.id)).where(eq5(courseEnrollments.userId, userId)).orderBy(desc3(courseEnrollments.lastAccessedAt));
}
async function updateEnrollmentProgress(enrollmentId, courseId) {
  const db = await getDb();
  if (!db) return;
  const totalLessons = await db.select({ count: sql2`count(*)` }).from(courseLessons).where(eq5(courseLessons.courseId, courseId));
  const completedLessons = await db.select({ count: sql2`count(*)` }).from(lessonProgress).where(
    and2(
      eq5(lessonProgress.enrollmentId, enrollmentId),
      eq5(lessonProgress.isCompleted, true)
    )
  );
  const total = totalLessons[0]?.count || 0;
  const completed = completedLessons[0]?.count || 0;
  const progress = total > 0 ? Math.round(completed / total * 100) : 0;
  await db.update(courseEnrollments).set({
    progressPercent: progress,
    completedLessonsCount: completed,
    lastAccessedAt: /* @__PURE__ */ new Date(),
    completedAt: progress === 100 ? /* @__PURE__ */ new Date() : null,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq5(courseEnrollments.id, enrollmentId));
}
async function updateLessonProgress(lessonId, userId, enrollmentId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await db.select().from(lessonProgress).where(
    and2(
      eq5(lessonProgress.lessonId, lessonId),
      eq5(lessonProgress.userId, userId)
    )
  ).limit(1);
  if (existing[0]) {
    await db.update(lessonProgress).set({
      ...data,
      completedAt: data.isCompleted ? /* @__PURE__ */ new Date() : null,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq5(lessonProgress.id, existing[0].id));
  } else {
    await db.insert(lessonProgress).values({
      lessonId,
      userId,
      enrollmentId,
      watchedSeconds: data.watchedSeconds || 0,
      isCompleted: data.isCompleted || false,
      completedAt: data.isCompleted ? /* @__PURE__ */ new Date() : null
    });
  }
  const lesson = await getLessonById(lessonId);
  if (lesson) {
    await updateEnrollmentProgress(enrollmentId, lesson.courseId);
  }
}
async function getLessonProgress(lessonId, userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lessonProgress).where(
    and2(
      eq5(lessonProgress.lessonId, lessonId),
      eq5(lessonProgress.userId, userId)
    )
  ).limit(1);
  return result[0] || null;
}
async function getCourseProgress(enrollmentId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    lesson: courseLessons,
    progress: lessonProgress
  }).from(courseLessons).leftJoin(
    lessonProgress,
    and2(
      eq5(lessonProgress.lessonId, courseLessons.id),
      eq5(lessonProgress.enrollmentId, enrollmentId)
    )
  ).orderBy(asc(courseLessons.orderIndex));
}
async function createReview(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(courseReviews).values({ ...data, isVerified: true }).returning({ id: courseReviews.id });
  await updateCourseRating(data.courseId);
  return result[0].id;
}
async function updateReview(reviewId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(courseReviews).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(courseReviews.id, reviewId));
  const review = await db.select({ courseId: courseReviews.courseId }).from(courseReviews).where(eq5(courseReviews.id, reviewId)).limit(1);
  if (review[0]) {
    await updateCourseRating(review[0].courseId);
  }
}
async function getCourseReviews(courseId, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    review: courseReviews,
    user: {
      id: users.id,
      name: users.name
    }
  }).from(courseReviews).innerJoin(users, eq5(courseReviews.userId, users.id)).where(eq5(courseReviews.courseId, courseId)).orderBy(desc3(courseReviews.createdAt)).limit(limit).offset(offset);
}
async function updateCourseRating(courseId) {
  const db = await getDb();
  if (!db) return;
  const reviews = await db.select({
    avgRating: sql2`AVG(${courseReviews.rating})`,
    count: sql2`COUNT(*)`
  }).from(courseReviews).where(eq5(courseReviews.courseId, courseId));
  await db.update(courses).set({
    averageRating: String(reviews[0]?.avgRating?.toFixed(2) || "0"),
    reviewsCount: reviews[0]?.count || 0,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq5(courses.id, courseId));
}
async function createDigitalProduct(data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(digitalProducts).values(data).returning({ id: digitalProducts.id });
  return result[0].id;
}
async function updateDigitalProduct(productId, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(digitalProducts).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(digitalProducts.id, productId));
}
async function deleteDigitalProduct(productId, creatorId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(digitalPurchases).where(eq5(digitalPurchases.productId, productId));
  await db.delete(digitalProducts).where(eq5(digitalProducts.id, productId));
}
async function getDigitalProductById(productId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(digitalProducts).where(eq5(digitalProducts.id, productId)).limit(1);
  return result[0] || null;
}
async function getDigitalProductBySlug(slug) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select({
    product: digitalProducts,
    creator: {
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName,
      avatarUrl: creatorProfiles.avatarUrl
    }
  }).from(digitalProducts).innerJoin(creatorProfiles, eq5(digitalProducts.creatorId, creatorProfiles.id)).where(eq5(digitalProducts.slug, slug)).limit(1);
  return result[0] || null;
}
async function getPublishedDigitalProducts(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    product: digitalProducts,
    creator: {
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName,
      avatarUrl: creatorProfiles.avatarUrl
    }
  }).from(digitalProducts).innerJoin(creatorProfiles, eq5(digitalProducts.creatorId, creatorProfiles.id)).where(eq5(digitalProducts.status, "published")).orderBy(desc3(digitalProducts.createdAt)).limit(limit).offset(offset);
}
async function getCreatorDigitalProducts(creatorId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(digitalProducts).where(eq5(digitalProducts.creatorId, creatorId)).orderBy(desc3(digitalProducts.createdAt));
}
async function createDigitalPurchase(productId, userId, pricePaidCents, orderId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(digitalPurchases).values({
    productId,
    userId,
    pricePaidCents,
    orderId
  });
  await db.update(digitalProducts).set({
    salesCount: sql2`${digitalProducts.salesCount} + 1`,
    updatedAt: /* @__PURE__ */ new Date()
  }).where(eq5(digitalProducts.id, productId));
}
async function getUserDigitalPurchases(userId) {
  const db = await getDb();
  if (!db) return [];
  return await db.select({
    purchase: digitalPurchases,
    product: digitalProducts,
    creator: {
      id: creatorProfiles.id,
      displayName: creatorProfiles.displayName
    }
  }).from(digitalPurchases).innerJoin(digitalProducts, eq5(digitalPurchases.productId, digitalProducts.id)).innerJoin(creatorProfiles, eq5(digitalProducts.creatorId, creatorProfiles.id)).where(eq5(digitalPurchases.userId, userId)).orderBy(desc3(digitalPurchases.createdAt));
}
async function hasUserPurchasedProduct(productId, userId) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(digitalPurchases).where(
    and2(
      eq5(digitalPurchases.productId, productId),
      eq5(digitalPurchases.userId, userId)
    )
  ).limit(1);
  return result.length > 0;
}
async function incrementDownloadCount(purchaseId) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(digitalPurchases).set({
    downloadCount: sql2`${digitalPurchases.downloadCount} + 1`,
    lastDownloadedAt: /* @__PURE__ */ new Date()
  }).where(eq5(digitalPurchases.id, purchaseId));
}

// server/routers-courses.ts
function generateSlug(title) {
  return title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").substring(0, 200);
}
var coursesRouter = router({
  // Get published courses (public)
  list: publicProcedure.input(
    z6.object({
      limit: z6.number().min(1).max(50).default(20),
      offset: z6.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    return await getPublishedCourses(input.limit, input.offset);
  }),
  // Get featured courses
  featured: publicProcedure.input(z6.object({ limit: z6.number().min(1).max(12).default(6) })).query(async ({ input }) => {
    return await getFeaturedCourses(input.limit);
  }),
  // Get course by slug (public)
  getBySlug: publicProcedure.input(z6.object({ slug: z6.string() })).query(async ({ input, ctx }) => {
    const course = await getCourseBySlug(input.slug);
    if (!course) return null;
    let enrollment = null;
    if (ctx.user) {
      enrollment = await getEnrollment(course.course.id, ctx.user.id);
    }
    return { ...course, enrollment };
  }),
  // Get course with all modules and lessons
  getWithContent: protectedProcedure.input(z6.object({ courseId: z6.number() })).query(async ({ input, ctx }) => {
    const course = await getCourseWithModules(input.courseId);
    if (!course) {
      throw new Error("Curso n\xE3o encontrado");
    }
    const enrollment = await getEnrollment(input.courseId, ctx.user.id);
    if (!enrollment) {
      const modulesWithFreeLessons = course.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
          videoUrl: lesson.isFree ? lesson.videoUrl : null,
          content: lesson.isFree ? lesson.content : null,
          downloadUrl: lesson.isFree ? lesson.downloadUrl : null
        }))
      }));
      return { ...course, modules: modulesWithFreeLessons, enrollment: null };
    }
    const progress = await getCourseProgress(enrollment.id);
    return { ...course, enrollment, progress };
  }),
  // Create course (creator only)
  create: protectedProcedure.input(
    z6.object({
      title: z6.string().min(3).max(255),
      description: z6.string().optional(),
      shortDescription: z6.string().max(500).optional(),
      thumbnailUrl: z6.string().max(500).optional(),
      previewVideoUrl: z6.string().max(500).optional(),
      priceCents: z6.number().min(0),
      compareAtPriceCents: z6.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile || profile.status !== "approved") {
      throw new Error("Voc\xEA precisa ser uma criadora aprovada para criar cursos");
    }
    const slug = generateSlug(input.title) + "-" + Date.now().toString(36);
    const courseId = await createCourse({
      creatorId: profile.id,
      ...input,
      slug,
      status: "draft"
    });
    return { success: true, courseId, slug };
  }),
  // Update course
  update: protectedProcedure.input(
    z6.object({
      courseId: z6.number(),
      title: z6.string().min(3).max(255).optional(),
      description: z6.string().optional(),
      shortDescription: z6.string().max(500).optional(),
      thumbnailUrl: z6.string().max(500).optional(),
      previewVideoUrl: z6.string().max(500).optional(),
      priceCents: z6.number().min(0).optional(),
      compareAtPriceCents: z6.number().optional(),
      status: z6.enum(["draft", "published", "archived"]).optional(),
      isFeatured: z6.boolean().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const course = await getCourseById(input.courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course || !isAdmin && course.creatorId !== profile.id) {
      throw new Error("Curso n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    const { courseId, ...data } = input;
    if (data.status === "published" && course.status !== "published") {
      await updateCourse(courseId, { ...data, publishedAt: /* @__PURE__ */ new Date() });
    } else {
      await updateCourse(courseId, data);
    }
    return { success: true };
  }),
  // Delete course
  delete: protectedProcedure.input(z6.object({ courseId: z6.number() })).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const course = await getCourseById(input.courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course || !isAdmin && course.creatorId !== profile.id) {
      throw new Error("Curso n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    await deleteCourse(input.courseId, profile.id);
    return { success: true };
  }),
  // Get creator's courses
  myCourses: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      return [];
    }
    return await getCreatorCourses(profile.id);
  })
});
var modulesRouter = router({
  // Create module
  create: protectedProcedure.input(
    z6.object({
      courseId: z6.number(),
      title: z6.string().min(1).max(255),
      description: z6.string().optional(),
      orderIndex: z6.number().default(0)
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const course = await getCourseById(input.courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course || !isAdmin && course.creatorId !== profile.id) {
      throw new Error("Curso n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    const moduleId = await createModule(input);
    return { success: true, moduleId };
  }),
  // Update module
  update: protectedProcedure.input(z6.object({
    moduleId: z6.number(),
    courseId: z6.number(),
    title: z6.string().optional(),
    description: z6.string().optional(),
    orderIndex: z6.number().optional()
  })).mutation(async ({ input, ctx }) => {
    const { moduleId, courseId, ...data } = input;
    const module = await getModuleById(moduleId);
    if (!module) throw new Error("M\xF3dulo n\xE3o encontrado");
    if (module.courseId !== courseId) throw new Error("M\xF3dulo n\xE3o pertence ao curso");
    const course = await getCourseById(courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course) throw new Error("Curso n\xE3o encontrado");
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || course.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
    }
    await updateModule(moduleId, data);
    return { success: true };
  }),
  // Delete module
  delete: protectedProcedure.input(z6.object({ moduleId: z6.number(), courseId: z6.number() })).mutation(async ({ input, ctx }) => {
    const { moduleId, courseId } = input;
    const module = await getModuleById(moduleId);
    if (!module) throw new Error("M\xF3dulo n\xE3o encontrado");
    if (module.courseId !== courseId) throw new Error("M\xF3dulo n\xE3o pertence ao curso");
    const course = await getCourseById(courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course) throw new Error("Curso n\xE3o encontrado");
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || course.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
    }
    await deleteModule(moduleId, courseId);
    return { success: true };
  }),
  // Reorder modules
  reorder: protectedProcedure.input(
    z6.object({
      courseId: z6.number(),
      moduleIds: z6.array(z6.number())
    })
  ).mutation(async ({ input }) => {
    await reorderModules(input.courseId, input.moduleIds);
    return { success: true };
  })
});
var lessonsRouter = router({
  // Get lesson by ID
  getById: protectedProcedure.input(z6.object({ lessonId: z6.number() })).query(async ({ input, ctx }) => {
    const lesson = await getLessonById(input.lessonId);
    if (!lesson) {
      throw new Error("Aula n\xE3o encontrada");
    }
    const enrollment = await getEnrollment(lesson.courseId, ctx.user.id);
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    const course = await getCourseById(lesson.courseId);
    const isCreator = profile && course && course.creatorId === profile.id;
    if (!enrollment && !isCreator && !lesson.isFree) {
      throw new Error("Voc\xEA precisa estar matriculado para acessar esta aula");
    }
    let progress = null;
    if (enrollment) {
      progress = await getLessonProgress(input.lessonId, ctx.user.id);
    }
    return { lesson, progress, enrollment };
  }),
  // Create lesson
  create: protectedProcedure.input(
    z6.object({
      moduleId: z6.number(),
      courseId: z6.number(),
      title: z6.string().min(1).max(255),
      description: z6.string().optional(),
      lessonType: z6.enum(["video", "text", "quiz", "download"]).default("video"),
      videoUrl: z6.string().max(500).optional(),
      videoDurationSeconds: z6.number().optional(),
      content: z6.string().optional(),
      downloadUrl: z6.string().max(500).optional(),
      orderIndex: z6.number().default(0),
      isFree: z6.boolean().default(false)
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      throw new Error("Perfil n\xE3o encontrado");
    }
    const course = await getCourseById(input.courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course || !isAdmin && course.creatorId !== profile.id) {
      throw new Error("Curso n\xE3o encontrado ou voc\xEA n\xE3o tem permiss\xE3o");
    }
    const lessonId = await createLesson(input);
    return { success: true, lessonId };
  }),
  // Update lesson
  update: protectedProcedure.input(z6.object({
    lessonId: z6.number(),
    courseId: z6.number(),
    moduleId: z6.number().optional(),
    title: z6.string().optional(),
    description: z6.string().optional(),
    lessonType: z6.enum(["video", "text", "quiz", "download"]).optional(),
    videoUrl: z6.string().optional(),
    videoDurationSeconds: z6.number().optional(),
    content: z6.string().optional(),
    downloadUrl: z6.string().optional(),
    isFree: z6.boolean().optional()
  })).mutation(async ({ input, ctx }) => {
    const { lessonId, courseId, ...data } = input;
    const lesson = await getLessonById(lessonId);
    if (!lesson) throw new Error("Aula n\xE3o encontrada");
    const module = await getModuleById(lesson.moduleId);
    if (!module || module.courseId !== courseId) throw new Error("Aula n\xE3o pertence ao curso");
    const course = await getCourseById(courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course) throw new Error("Curso n\xE3o encontrado");
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || course.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
    }
    await updateLesson(lessonId, data);
    return { success: true };
  }),
  // Delete lesson
  delete: protectedProcedure.input(z6.object({ lessonId: z6.number(), moduleId: z6.number(), courseId: z6.number() })).mutation(async ({ input, ctx }) => {
    const { lessonId, moduleId, courseId } = input;
    const lesson = await getLessonById(lessonId);
    if (!lesson) throw new Error("Aula n\xE3o encontrada");
    if (lesson.moduleId !== moduleId) throw new Error("Aula n\xE3o pertence ao m\xF3dulo");
    const module = await getModuleById(moduleId);
    if (!module || module.courseId !== courseId) throw new Error("M\xF3dulo n\xE3o pertence ao curso");
    const course = await getCourseById(courseId);
    const isAdmin = ctx.user.role === "admin";
    if (!course) throw new Error("Curso n\xE3o encontrado");
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || course.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
    }
    await deleteLesson(lessonId, moduleId, courseId);
    return { success: true };
  }),
  // Reorder lessons
  reorder: protectedProcedure.input(
    z6.object({
      moduleId: z6.number(),
      lessonIds: z6.array(z6.number())
    })
  ).mutation(async ({ input }) => {
    await reorderLessons(input.moduleId, input.lessonIds);
    return { success: true };
  }),
  // Update progress
  updateProgress: protectedProcedure.input(
    z6.object({
      lessonId: z6.number(),
      watchedSeconds: z6.number().optional(),
      isCompleted: z6.boolean().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const lesson = await getLessonById(input.lessonId);
    if (!lesson) {
      throw new Error("Aula n\xE3o encontrada");
    }
    const enrollment = await getEnrollment(lesson.courseId, ctx.user.id);
    if (!enrollment) {
      throw new Error("Voc\xEA n\xE3o est\xE1 matriculado neste curso");
    }
    await updateLessonProgress(
      input.lessonId,
      ctx.user.id,
      enrollment.id,
      {
        watchedSeconds: input.watchedSeconds,
        isCompleted: input.isCompleted
      }
    );
    return { success: true };
  })
});
var enrollmentsRouter = router({
  // Get user's enrollments
  myEnrollments: protectedProcedure.query(async ({ ctx }) => {
    return await getUserEnrollments(ctx.user.id);
  }),
  // Check enrollment status
  check: protectedProcedure.input(z6.object({ courseId: z6.number() })).query(async ({ input, ctx }) => {
    return await getEnrollment(input.courseId, ctx.user.id);
  }),
  // Enroll in a course (for now, direct enrollment - can add payment later)
  enroll: protectedProcedure.input(
    z6.object({
      courseId: z6.number(),
      orderId: z6.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const course = await getCourseById(input.courseId);
    if (!course) {
      throw new Error("Curso n\xE3o encontrado");
    }
    if (course.status !== "published") {
      throw new Error("Este curso n\xE3o est\xE1 dispon\xEDvel para matr\xEDcula");
    }
    const existing = await getEnrollment(input.courseId, ctx.user.id);
    if (existing) {
      throw new Error("Voc\xEA j\xE1 est\xE1 matriculado neste curso");
    }
    const enrollmentId = await createEnrollment({
      courseId: input.courseId,
      userId: ctx.user.id,
      orderId: input.orderId,
      pricePaidCents: course.priceCents
    });
    return { success: true, enrollmentId };
  })
});
var reviewsRouter = router({
  // Get course reviews
  list: publicProcedure.input(
    z6.object({
      courseId: z6.number(),
      limit: z6.number().min(1).max(50).default(20),
      offset: z6.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    return await getCourseReviews(input.courseId, input.limit, input.offset);
  }),
  // Create review
  create: protectedProcedure.input(
    z6.object({
      courseId: z6.number(),
      rating: z6.number().min(1).max(5),
      title: z6.string().max(255).optional(),
      content: z6.string().max(2e3).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const enrollment = await getEnrollment(input.courseId, ctx.user.id);
    if (!enrollment) {
      throw new Error("Voc\xEA precisa estar matriculado para avaliar");
    }
    const reviewId = await createReview({
      courseId: input.courseId,
      userId: ctx.user.id,
      enrollmentId: enrollment.id,
      rating: input.rating,
      title: input.title,
      content: input.content
    });
    return { success: true, reviewId };
  }),
  // Update review
  update: protectedProcedure.input(
    z6.object({
      reviewId: z6.number(),
      rating: z6.number().min(1).max(5).optional(),
      title: z6.string().max(255).optional(),
      content: z6.string().max(2e3).optional()
    })
  ).mutation(async ({ input }) => {
    const { reviewId, ...data } = input;
    await updateReview(reviewId, data);
    return { success: true };
  })
});
var digitalProductsRouter = router({
  // List published digital products
  list: publicProcedure.input(
    z6.object({
      limit: z6.number().min(1).max(50).default(20),
      offset: z6.number().min(0).default(0)
    })
  ).query(async ({ input }) => {
    return await getPublishedDigitalProducts(input.limit, input.offset);
  }),
  // Get by slug
  getBySlug: publicProcedure.input(z6.object({ slug: z6.string() })).query(async ({ input, ctx }) => {
    const product = await getDigitalProductBySlug(input.slug);
    if (!product) return null;
    let hasPurchased = false;
    if (ctx.user) {
      hasPurchased = await hasUserPurchasedProduct(product.product.id, ctx.user.id);
    }
    return { ...product, hasPurchased };
  }),
  // Create digital product
  create: protectedProcedure.input(
    z6.object({
      title: z6.string().min(3).max(255),
      description: z6.string().optional(),
      shortDescription: z6.string().max(500).optional(),
      thumbnailUrl: z6.string().max(500).optional(),
      previewUrl: z6.string().max(500).optional(),
      fileUrl: z6.string().max(500),
      fileType: z6.string().max(50),
      fileSizeBytes: z6.number().optional(),
      priceCents: z6.number().min(0),
      compareAtPriceCents: z6.number().optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile || profile.status !== "approved") {
      throw new Error("Voc\xEA precisa ser uma criadora aprovada");
    }
    const slug = generateSlug(input.title) + "-" + Date.now().toString(36);
    const productId = await createDigitalProduct({
      creatorId: profile.id,
      ...input,
      slug,
      status: "draft"
    });
    return { success: true, productId, slug };
  }),
  // Update digital product
  update: protectedProcedure.input(
    z6.object({
      productId: z6.number(),
      title: z6.string().min(3).max(255).optional(),
      description: z6.string().optional(),
      shortDescription: z6.string().max(500).optional(),
      thumbnailUrl: z6.string().max(500).optional(),
      previewUrl: z6.string().max(500).optional(),
      fileUrl: z6.string().max(500).optional(),
      fileType: z6.string().max(50).optional(),
      fileSizeBytes: z6.number().optional(),
      priceCents: z6.number().min(0).optional(),
      compareAtPriceCents: z6.number().optional(),
      status: z6.enum(["draft", "published", "archived"]).optional()
    })
  ).mutation(async ({ input, ctx }) => {
    const { productId, ...data } = input;
    const product = await getDigitalProductById(productId);
    if (!product) throw new Error("Produto n\xE3o encontrado");
    const isAdmin = ctx.user.role === "admin";
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || product.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
    }
    await updateDigitalProduct(productId, data);
    return { success: true };
  }),
  // Delete digital product
  delete: protectedProcedure.input(z6.object({ productId: z6.number() })).mutation(async ({ input, ctx }) => {
    const product = await getDigitalProductById(input.productId);
    if (!product) throw new Error("Produto n\xE3o encontrado");
    const isAdmin = ctx.user.role === "admin";
    if (!isAdmin) {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || product.creatorId !== profile.id) {
        throw new Error("Voc\xEA n\xE3o tem permiss\xE3o");
      }
      await deleteDigitalProduct(input.productId, profile.id);
    } else {
      await deleteDigitalProduct(input.productId, product.creatorId);
    }
    return { success: true };
  }),
  // Get creator's digital products
  myProducts: protectedProcedure.query(async ({ ctx }) => {
    const profile = await getCreatorProfileByUserId(ctx.user.id);
    if (!profile) {
      return [];
    }
    return await getCreatorDigitalProducts(profile.id);
  }),
  // Get user's purchases
  myPurchases: protectedProcedure.query(async ({ ctx }) => {
    const purchases = await getUserDigitalPurchases(ctx.user.id);
    return purchases.map((p) => ({
      purchase: {
        id: p.purchase.id,
        productId: p.purchase.productId,
        pricePaidCents: p.purchase.pricePaidCents,
        downloadCount: p.purchase.downloadCount,
        lastDownloadedAt: p.purchase.lastDownloadedAt,
        createdAt: p.purchase.createdAt
      },
      product: {
        id: p.product.id,
        title: p.product.title,
        slug: p.product.slug,
        fileType: p.product.fileType,
        fileUrl: p.product.fileUrl,
        thumbnailUrl: p.product.thumbnailUrl
      },
      creator: p.creator
    }));
  }),
  // Purchase digital product
  purchase: protectedProcedure.input(z6.object({ productId: z6.number(), orderId: z6.number().optional() })).mutation(async ({ input, ctx }) => {
    const product = await getDigitalProductBySlug("");
    await createDigitalPurchase(
      input.productId,
      ctx.user.id,
      0,
      // Price should come from actual product
      input.orderId
    );
    return { success: true };
  }),
  // Download purchased product
  download: protectedProcedure.input(z6.object({ purchaseId: z6.number() })).mutation(async ({ input, ctx }) => {
    const purchases = await getUserDigitalPurchases(ctx.user.id);
    const purchaseData = purchases.find((p) => p.purchase.id === input.purchaseId);
    if (!purchaseData) {
      throw new Error("Compra n\xE3o encontrada");
    }
    if (!purchaseData.product.fileUrl) {
      throw new Error("Arquivo n\xE3o dispon\xEDvel");
    }
    await incrementDownloadCount(input.purchaseId);
    return {
      success: true,
      downloadUrl: purchaseData.product.fileUrl
    };
  })
});
var marketplaceRouter = router({
  courses: coursesRouter,
  modules: modulesRouter,
  lessons: lessonsRouter,
  enrollments: enrollmentsRouter,
  reviews: reviewsRouter,
  digitalProducts: digitalProductsRouter
});

// server/routers.ts
var appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true
      };
    })
  }),
  products: productsRouter,
  checkout: checkoutRouter,
  orders: ordersRouter,
  profile: profileRouter,
  addresses: addressRouter,
  admin: adminRouter,
  // Social Network & Community
  social: socialRouter,
  // Marketplace (Courses & Digital Products)
  marketplace: marketplaceRouter
});

// api/index.ts
var app = express();
app.use(helmet());
app.use(cors());
var limiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 100,
  // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api", limiter);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
registerOAuthRoutes(app);
app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext
  })
);
var index_default = app;
export {
  index_default as default
};
