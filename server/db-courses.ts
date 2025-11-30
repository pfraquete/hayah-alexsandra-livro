import { eq, desc, and, sql, inArray, asc } from "drizzle-orm";
import { getDb } from "./db";
import {
  courses,
  courseModules,
  courseLessons,
  courseEnrollments,
  lessonProgress,
  courseReviews,
  digitalProducts,
  digitalPurchases,
  creatorProfiles,
  users,
  type InsertCourse,
  type InsertCourseModule,
  type InsertCourseLesson,
  type InsertCourseEnrollment,
  type InsertCourseReview,
  type InsertDigitalProduct,
} from "../drizzle/schema";

// ============================================
// COURSE FUNCTIONS
// ============================================

export async function createCourse(data: InsertCourse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(courses).values(data).returning({ id: courses.id });

  // Increment courses count for creator
  await db
    .update(creatorProfiles)
    .set({
      coursesCount: sql`${creatorProfiles.coursesCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(creatorProfiles.id, data.creatorId));

  return result[0].id;
}

export async function updateCourse(courseId: number, data: Partial<InsertCourse>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(courses)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courses.id, courseId));
}

export async function getCourseById(courseId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(courses)
    .where(eq(courses.id, courseId))
    .limit(1);
  return result[0] || null;
}

export async function getCourseBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      course: courses,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
        avatarUrl: creatorProfiles.avatarUrl,
        userId: creatorProfiles.userId,
      },
    })
    .from(courses)
    .innerJoin(creatorProfiles, eq(courses.creatorId, creatorProfiles.id))
    .where(eq(courses.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function getCourseWithModules(courseId: number) {
  const db = await getDb();
  if (!db) return null;

  const course = await getCourseById(courseId);
  if (!course) return null;

  const modules = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId))
    .orderBy(asc(courseModules.orderIndex));

  const modulesWithLessons = await Promise.all(
    modules.map(async (module) => {
      const lessons = await db
        .select()
        .from(courseLessons)
        .where(eq(courseLessons.moduleId, module.id))
        .orderBy(asc(courseLessons.orderIndex));
      return { ...module, lessons };
    })
  );

  return { ...course, modules: modulesWithLessons };
}

export async function getPublishedCourses(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      course: courses,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
        avatarUrl: creatorProfiles.avatarUrl,
      },
    })
    .from(courses)
    .innerJoin(creatorProfiles, eq(courses.creatorId, creatorProfiles.id))
    .where(eq(courses.status, "published"))
    .orderBy(desc(courses.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getFeaturedCourses(limit = 6) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      course: courses,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
        avatarUrl: creatorProfiles.avatarUrl,
      },
    })
    .from(courses)
    .innerJoin(creatorProfiles, eq(courses.creatorId, creatorProfiles.id))
    .where(and(eq(courses.status, "published"), eq(courses.isFeatured, true)))
    .orderBy(desc(courses.studentsCount))
    .limit(limit);
}

export async function getCreatorCourses(creatorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(courses)
    .where(eq(courses.creatorId, creatorId))
    .orderBy(desc(courses.createdAt));
}

export async function deleteCourse(courseId: number, creatorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete all related data
  const modules = await db
    .select({ id: courseModules.id })
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId));

  if (modules.length > 0) {
    const moduleIds = modules.map((m) => m.id);

    // Delete lessons and their progress
    const lessons = await db
      .select({ id: courseLessons.id })
      .from(courseLessons)
      .where(inArray(courseLessons.moduleId, moduleIds));

    if (lessons.length > 0) {
      await db
        .delete(lessonProgress)
        .where(inArray(lessonProgress.lessonId, lessons.map((l) => l.id)));
    }

    await db
      .delete(courseLessons)
      .where(inArray(courseLessons.moduleId, moduleIds));
    await db.delete(courseModules).where(eq(courseModules.courseId, courseId));
  }

  // Delete enrollments and reviews
  await db.delete(courseEnrollments).where(eq(courseEnrollments.courseId, courseId));
  await db.delete(courseReviews).where(eq(courseReviews.courseId, courseId));

  // Delete course
  await db.delete(courses).where(eq(courses.id, courseId));

  // Decrement courses count
  await db
    .update(creatorProfiles)
    .set({
      coursesCount: sql`GREATEST(${creatorProfiles.coursesCount} - 1, 0)`,
      updatedAt: new Date(),
    })
    .where(eq(creatorProfiles.id, creatorId));
}

// ============================================
// MODULE FUNCTIONS
// ============================================

export async function createModule(data: InsertCourseModule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .insert(courseModules)
    .values(data)
    .returning({ id: courseModules.id });
  return result[0].id;
}

export async function updateModule(moduleId: number, data: Partial<InsertCourseModule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(courseModules)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courseModules.id, moduleId));
}

export async function deleteModule(moduleId: number, courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete lessons in module
  const lessons = await db
    .select({ id: courseLessons.id })
    .from(courseLessons)
    .where(eq(courseLessons.moduleId, moduleId));

  if (lessons.length > 0) {
    await db
      .delete(lessonProgress)
      .where(inArray(lessonProgress.lessonId, lessons.map((l) => l.id)));
    await db.delete(courseLessons).where(eq(courseLessons.moduleId, moduleId));
  }

  // Delete module
  await db.delete(courseModules).where(eq(courseModules.id, moduleId));

  // Update course lesson count
  await updateCourseLessonCount(courseId);
}

export async function reorderModules(courseId: number, moduleIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  for (let i = 0; i < moduleIds.length; i++) {
    await db
      .update(courseModules)
      .set({ orderIndex: i, updatedAt: new Date() })
      .where(
        and(
          eq(courseModules.id, moduleIds[i]),
          eq(courseModules.courseId, courseId)
        )
      );
  }
}

// ============================================
// LESSON FUNCTIONS
// ============================================

export async function createLesson(data: InsertCourseLesson) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .insert(courseLessons)
    .values(data)
    .returning({ id: courseLessons.id });

  // Update module and course counts
  await updateModuleLessonCount(data.moduleId);
  await updateCourseLessonCount(data.courseId);

  return result[0].id;
}

export async function updateLesson(lessonId: number, data: Partial<InsertCourseLesson>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(courseLessons)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courseLessons.id, lessonId));
}

export async function getLessonById(lessonId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(courseLessons)
    .where(eq(courseLessons.id, lessonId))
    .limit(1);
  return result[0] || null;
}

export async function deleteLesson(lessonId: number, moduleId: number, courseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete progress
  await db.delete(lessonProgress).where(eq(lessonProgress.lessonId, lessonId));

  // Delete lesson
  await db.delete(courseLessons).where(eq(courseLessons.id, lessonId));

  // Update counts
  await updateModuleLessonCount(moduleId);
  await updateCourseLessonCount(courseId);
}

export async function reorderLessons(moduleId: number, lessonIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  for (let i = 0; i < lessonIds.length; i++) {
    await db
      .update(courseLessons)
      .set({ orderIndex: i, updatedAt: new Date() })
      .where(
        and(
          eq(courseLessons.id, lessonIds[i]),
          eq(courseLessons.moduleId, moduleId)
        )
      );
  }
}

async function updateModuleLessonCount(moduleId: number) {
  const db = await getDb();
  if (!db) return;

  const lessons = await db
    .select({
      count: sql<number>`count(*)`,
      duration: sql<number>`COALESCE(SUM(${courseLessons.videoDurationSeconds}), 0)`
    })
    .from(courseLessons)
    .where(eq(courseLessons.moduleId, moduleId));

  await db
    .update(courseModules)
    .set({
      lessonsCount: lessons[0]?.count || 0,
      durationMinutes: Math.ceil((lessons[0]?.duration || 0) / 60),
      updatedAt: new Date(),
    })
    .where(eq(courseModules.id, moduleId));
}

async function updateCourseLessonCount(courseId: number) {
  const db = await getDb();
  if (!db) return;

  const lessons = await db
    .select({
      count: sql<number>`count(*)`,
      duration: sql<number>`COALESCE(SUM(${courseLessons.videoDurationSeconds}), 0)`
    })
    .from(courseLessons)
    .where(eq(courseLessons.courseId, courseId));

  await db
    .update(courses)
    .set({
      lessonsCount: lessons[0]?.count || 0,
      totalDurationMinutes: Math.ceil((lessons[0]?.duration || 0) / 60),
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId));
}

// ============================================
// ENROLLMENT FUNCTIONS
// ============================================

export async function createEnrollment(data: InsertCourseEnrollment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .insert(courseEnrollments)
    .values(data)
    .returning({ id: courseEnrollments.id });

  // Increment students count
  await db
    .update(courses)
    .set({
      studentsCount: sql`${courses.studentsCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, data.courseId));

  return result[0].id;
}

export async function getEnrollment(courseId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(courseEnrollments)
    .where(
      and(
        eq(courseEnrollments.courseId, courseId),
        eq(courseEnrollments.userId, userId)
      )
    )
    .limit(1);
  return result[0] || null;
}

export async function getUserEnrollments(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      enrollment: courseEnrollments,
      course: courses,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
        avatarUrl: creatorProfiles.avatarUrl,
      },
    })
    .from(courseEnrollments)
    .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .innerJoin(creatorProfiles, eq(courses.creatorId, creatorProfiles.id))
    .where(eq(courseEnrollments.userId, userId))
    .orderBy(desc(courseEnrollments.lastAccessedAt));
}

export async function updateEnrollmentProgress(enrollmentId: number, courseId: number) {
  const db = await getDb();
  if (!db) return;

  // Calculate progress
  const totalLessons = await db
    .select({ count: sql<number>`count(*)` })
    .from(courseLessons)
    .where(eq(courseLessons.courseId, courseId));

  const completedLessons = await db
    .select({ count: sql<number>`count(*)` })
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.enrollmentId, enrollmentId),
        eq(lessonProgress.isCompleted, true)
      )
    );

  const total = totalLessons[0]?.count || 0;
  const completed = completedLessons[0]?.count || 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  await db
    .update(courseEnrollments)
    .set({
      progressPercent: progress,
      completedLessonsCount: completed,
      lastAccessedAt: new Date(),
      completedAt: progress === 100 ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(courseEnrollments.id, enrollmentId));
}

// ============================================
// LESSON PROGRESS FUNCTIONS
// ============================================

export async function updateLessonProgress(
  lessonId: number,
  userId: number,
  enrollmentId: number,
  data: { watchedSeconds?: number; isCompleted?: boolean }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.lessonId, lessonId),
        eq(lessonProgress.userId, userId)
      )
    )
    .limit(1);

  if (existing[0]) {
    await db
      .update(lessonProgress)
      .set({
        ...data,
        completedAt: data.isCompleted ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(lessonProgress.id, existing[0].id));
  } else {
    await db.insert(lessonProgress).values({
      lessonId,
      userId,
      enrollmentId,
      watchedSeconds: data.watchedSeconds || 0,
      isCompleted: data.isCompleted || false,
      completedAt: data.isCompleted ? new Date() : null,
    });
  }

  // Get courseId from lesson
  const lesson = await getLessonById(lessonId);
  if (lesson) {
    await updateEnrollmentProgress(enrollmentId, lesson.courseId);
  }
}

export async function getLessonProgress(lessonId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(lessonProgress)
    .where(
      and(
        eq(lessonProgress.lessonId, lessonId),
        eq(lessonProgress.userId, userId)
      )
    )
    .limit(1);
  return result[0] || null;
}

export async function getCourseProgress(enrollmentId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      lesson: courseLessons,
      progress: lessonProgress,
    })
    .from(courseLessons)
    .leftJoin(
      lessonProgress,
      and(
        eq(lessonProgress.lessonId, courseLessons.id),
        eq(lessonProgress.enrollmentId, enrollmentId)
      )
    )
    .orderBy(asc(courseLessons.orderIndex));
}

// ============================================
// REVIEW FUNCTIONS
// ============================================

export async function createReview(data: InsertCourseReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .insert(courseReviews)
    .values({ ...data, isVerified: true })
    .returning({ id: courseReviews.id });

  // Update course rating
  await updateCourseRating(data.courseId);

  return result[0].id;
}

export async function updateReview(reviewId: number, data: { rating?: number; title?: string; content?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(courseReviews)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(courseReviews.id, reviewId));

  const review = await db
    .select({ courseId: courseReviews.courseId })
    .from(courseReviews)
    .where(eq(courseReviews.id, reviewId))
    .limit(1);

  if (review[0]) {
    await updateCourseRating(review[0].courseId);
  }
}

export async function getCourseReviews(courseId: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      review: courseReviews,
      user: {
        id: users.id,
        name: users.name,
      },
    })
    .from(courseReviews)
    .innerJoin(users, eq(courseReviews.userId, users.id))
    .where(eq(courseReviews.courseId, courseId))
    .orderBy(desc(courseReviews.createdAt))
    .limit(limit)
    .offset(offset);
}

async function updateCourseRating(courseId: number) {
  const db = await getDb();
  if (!db) return;

  const reviews = await db
    .select({
      avgRating: sql<number>`AVG(${courseReviews.rating})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(courseReviews)
    .where(eq(courseReviews.courseId, courseId));

  await db
    .update(courses)
    .set({
      averageRating: String(reviews[0]?.avgRating?.toFixed(2) || "0"),
      reviewsCount: reviews[0]?.count || 0,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId));
}

// ============================================
// DIGITAL PRODUCTS FUNCTIONS
// ============================================

export async function createDigitalProduct(data: InsertDigitalProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .insert(digitalProducts)
    .values(data)
    .returning({ id: digitalProducts.id });
  return result[0].id;
}

export async function updateDigitalProduct(productId: number, data: Partial<InsertDigitalProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(digitalProducts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(digitalProducts.id, productId));
}

export async function getDigitalProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      product: digitalProducts,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
        avatarUrl: creatorProfiles.avatarUrl,
      },
    })
    .from(digitalProducts)
    .innerJoin(creatorProfiles, eq(digitalProducts.creatorId, creatorProfiles.id))
    .where(eq(digitalProducts.slug, slug))
    .limit(1);
  return result[0] || null;
}

export async function getPublishedDigitalProducts(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      product: digitalProducts,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
        avatarUrl: creatorProfiles.avatarUrl,
      },
    })
    .from(digitalProducts)
    .innerJoin(creatorProfiles, eq(digitalProducts.creatorId, creatorProfiles.id))
    .where(eq(digitalProducts.status, "published"))
    .orderBy(desc(digitalProducts.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getCreatorDigitalProducts(creatorId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(digitalProducts)
    .where(eq(digitalProducts.creatorId, creatorId))
    .orderBy(desc(digitalProducts.createdAt));
}

export async function createDigitalPurchase(
  productId: number,
  userId: number,
  pricePaidCents: number,
  orderId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(digitalPurchases).values({
    productId,
    userId,
    pricePaidCents,
    orderId,
  });

  // Increment sales count
  await db
    .update(digitalProducts)
    .set({
      salesCount: sql`${digitalProducts.salesCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(digitalProducts.id, productId));
}

export async function getUserDigitalPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      purchase: digitalPurchases,
      product: digitalProducts,
      creator: {
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
      },
    })
    .from(digitalPurchases)
    .innerJoin(digitalProducts, eq(digitalPurchases.productId, digitalProducts.id))
    .innerJoin(creatorProfiles, eq(digitalProducts.creatorId, creatorProfiles.id))
    .where(eq(digitalPurchases.userId, userId))
    .orderBy(desc(digitalPurchases.createdAt));
}

export async function hasUserPurchasedProduct(productId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select()
    .from(digitalPurchases)
    .where(
      and(
        eq(digitalPurchases.productId, productId),
        eq(digitalPurchases.userId, userId)
      )
    )
    .limit(1);
  return result.length > 0;
}

export async function incrementDownloadCount(purchaseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(digitalPurchases)
    .set({
      downloadCount: sql`${digitalPurchases.downloadCount} + 1`,
      lastDownloadedAt: new Date(),
    })
    .where(eq(digitalPurchases.id, purchaseId));
}
