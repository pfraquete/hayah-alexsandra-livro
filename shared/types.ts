/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

// Re-export types from db modules
export type { User, InsertUser } from "../server/db";
export type {
  Product,
  Order,
  OrderItem,
  Address,
  Shipment,
  InsertOrder,
  InsertOrderItem,
  InsertAddress,
  InsertProduct,
} from "../server/db-products";
export type {
  CreatorProfile,
  Post,
  PostMedia,
  PostComment,
  Notification,
  InsertCreatorProfile,
  InsertPost,
  InsertPostMedia,
  InsertPostComment,
  InsertNotification,
} from "../server/db-social";
export type {
  Course,
  CourseModule,
  CourseLesson,
  CourseEnrollment,
  LessonProgress,
  CourseReview,
  DigitalProduct,
  DigitalPurchase,
  InsertCourse,
  InsertCourseModule,
  InsertCourseLesson,
  InsertCourseEnrollment,
  InsertCourseReview,
  InsertDigitalProduct,
} from "../server/db-courses";
export type { InsertShipment } from "../server/db-admin";

// Re-export errors
export * from "./_core/errors";
