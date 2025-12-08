import { supabaseAdmin } from "./supabase";

// Types for courses module
export interface Course {
  id: number;
  creatorId: number;
  title: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  previewVideoUrl: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  status: "draft" | "published" | "archived";
  lessonsCount: number;
  totalDurationMinutes: number;
  studentsCount: number;
  averageRating: string | null;
  reviewsCount: number;
  isFeatured: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  description: string | null;
  orderIndex: number;
  lessonsCount: number;
  durationMinutes: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CourseLesson {
  id: number;
  moduleId: number;
  courseId: number;
  title: string;
  description: string | null;
  lessonType: "video" | "text" | "quiz" | "download";
  videoUrl: string | null;
  videoDurationSeconds: number | null;
  content: string | null;
  orderIndex: number;
  isFree: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CourseEnrollment {
  id: number;
  courseId: number;
  userId: number;
  progressPercent: number;
  completedLessonsCount: number;
  lastAccessedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface LessonProgress {
  id: number;
  lessonId: number;
  userId: number;
  enrollmentId: number;
  watchedSeconds: number;
  isCompleted: boolean;
  completedAt: Date | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface CourseReview {
  id: number;
  courseId: number;
  userId: number;
  rating: number;
  title: string | null;
  content: string | null;
  isVerified: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface DigitalProduct {
  id: number;
  creatorId: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  fileUrl: string;
  fileType: string;
  fileSizeBytes: number | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  status: "draft" | "published" | "archived";
  salesCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface DigitalPurchase {
  id: number;
  productId: number;
  userId: number;
  orderId: number | null;
  pricePaidCents: number;
  downloadCount: number;
  lastDownloadedAt: Date | null;
  createdAt: Date | null;
}

export interface InsertCourse {
  creatorId: number;
  title: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  thumbnailUrl?: string | null;
  previewVideoUrl?: string | null;
  priceCents: number;
  compareAtPriceCents?: number | null;
  status?: "draft" | "published" | "archived";
  isFeatured?: boolean;
}

export interface InsertCourseModule {
  courseId: number;
  title: string;
  description?: string | null;
  orderIndex: number;
}

export interface InsertCourseLesson {
  moduleId: number;
  courseId: number;
  title: string;
  description?: string | null;
  lessonType?: "video" | "text" | "quiz" | "download";
  videoUrl?: string | null;
  videoDurationSeconds?: number | null;
  content?: string | null;
  orderIndex: number;
  isFree?: boolean;
}

export interface InsertCourseEnrollment {
  courseId: number;
  userId: number;
}

export interface InsertCourseReview {
  courseId: number;
  userId: number;
  rating: number;
  title?: string | null;
  content?: string | null;
}

export interface InsertDigitalProduct {
  creatorId: number;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  fileUrl: string;
  fileType: string;
  fileSizeBytes?: number | null;
  priceCents: number;
  compareAtPriceCents?: number | null;
  status?: "draft" | "published" | "archived";
}

// ============================================
// COURSE FUNCTIONS
// ============================================

export async function createCourse(data: InsertCourse): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('courses')
    .insert({
      ...data,
      status: data.status || 'draft',
      isFeatured: data.isFeatured || false,
      lessonsCount: 0,
      totalDurationMinutes: 0,
      studentsCount: 0,
      reviewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating course:", error);
    throw error;
  }

  // Increment courses count for creator
  const { data: profile } = await supabaseAdmin
    .from('creatorProfiles')
    .select('coursesCount')
    .eq('id', data.creatorId)
    .single();

  if (profile) {
    await supabaseAdmin
      .from('creatorProfiles')
      .update({
        coursesCount: (profile.coursesCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', data.creatorId);
  }

  return result.id;
}

export async function updateCourse(courseId: number, data: Partial<InsertCourse>): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { error } = await supabaseAdmin
    .from('courses')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', courseId);

  if (error) {
    console.error("[Database] Error updating course:", error);
    throw error;
  }
}

export async function getCourseById(courseId: number): Promise<Course | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) return null;
  return data as Course;
}

export async function getCourseBySlug(slug: string) {
  if (!supabaseAdmin) return null;

  const { data: course, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !course) return null;

  const { data: creator } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName, avatarUrl, userId')
    .eq('id', course.creatorId)
    .single();

  return {
    course,
    creator: creator || { id: course.creatorId, displayName: 'Unknown', avatarUrl: null, userId: 0 },
  };
}

export async function getCourseWithModules(courseId: number) {
  if (!supabaseAdmin) return null;

  const course = await getCourseById(courseId);
  if (!course) return null;

  const { data: modules } = await supabaseAdmin
    .from('courseModules')
    .select('*')
    .eq('courseId', courseId)
    .order('orderIndex', { ascending: true });

  if (!modules) return { ...course, modules: [] };

  const modulesWithLessons = await Promise.all(
    modules.map(async (module) => {
      const { data: lessons } = await supabaseAdmin
        .from('courseLessons')
        .select('*')
        .eq('moduleId', module.id)
        .order('orderIndex', { ascending: true });
      return { ...module, lessons: lessons || [] };
    })
  );

  return { ...course, modules: modulesWithLessons };
}

export async function getPublishedCourses(limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];

  const { data: courses, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !courses) return [];

  const creatorIds = [...new Set(courses.map(c => c.creatorId))];
  const { data: creators } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName, avatarUrl')
    .in('id', creatorIds);

  const creatorsMap = new Map((creators || []).map(c => [c.id, c]));

  return courses.map(course => ({
    course,
    creator: creatorsMap.get(course.creatorId) || { id: course.creatorId, displayName: 'Unknown', avatarUrl: null },
  }));
}

export async function getFeaturedCourses(limit = 6) {
  if (!supabaseAdmin) return [];

  const { data: courses, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('status', 'published')
    .eq('isFeatured', true)
    .order('studentsCount', { ascending: false })
    .limit(limit);

  if (error || !courses) return [];

  const creatorIds = [...new Set(courses.map(c => c.creatorId))];
  const { data: creators } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName, avatarUrl')
    .in('id', creatorIds);

  const creatorsMap = new Map((creators || []).map(c => [c.id, c]));

  return courses.map(course => ({
    course,
    creator: creatorsMap.get(course.creatorId) || { id: course.creatorId, displayName: 'Unknown', avatarUrl: null },
  }));
}

export async function getCreatorCourses(creatorId: number): Promise<Course[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('courses')
    .select('*')
    .eq('creatorId', creatorId)
    .order('createdAt', { ascending: false });

  if (error) return [];
  return (data || []) as Course[];
}

export async function deleteCourse(courseId: number, creatorId: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  // Get modules
  const { data: modules } = await supabaseAdmin
    .from('courseModules')
    .select('id')
    .eq('courseId', courseId);

  if (modules && modules.length > 0) {
    const moduleIds = modules.map(m => m.id);

    // Get lessons
    const { data: lessons } = await supabaseAdmin
      .from('courseLessons')
      .select('id')
      .in('moduleId', moduleIds);

    if (lessons && lessons.length > 0) {
      const lessonIds = lessons.map(l => l.id);
      // Delete lesson progress
      await supabaseAdmin.from('lessonProgress').delete().in('lessonId', lessonIds);
    }

    // Delete lessons
    await supabaseAdmin.from('courseLessons').delete().in('moduleId', moduleIds);

    // Delete modules
    await supabaseAdmin.from('courseModules').delete().eq('courseId', courseId);
  }

  // Delete enrollments and reviews
  await supabaseAdmin.from('courseEnrollments').delete().eq('courseId', courseId);
  await supabaseAdmin.from('courseReviews').delete().eq('courseId', courseId);

  // Delete course
  await supabaseAdmin.from('courses').delete().eq('id', courseId);

  // Decrement courses count
  const { data: profile } = await supabaseAdmin
    .from('creatorProfiles')
    .select('coursesCount')
    .eq('id', creatorId)
    .single();

  if (profile) {
    await supabaseAdmin
      .from('creatorProfiles')
      .update({
        coursesCount: Math.max((profile.coursesCount || 0) - 1, 0),
        updatedAt: new Date().toISOString(),
      })
      .eq('id', creatorId);
  }
}

// ============================================
// MODULE FUNCTIONS
// ============================================

export async function createModule(data: InsertCourseModule): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('courseModules')
    .insert({
      ...data,
      lessonsCount: 0,
      durationMinutes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating module:", error);
    throw error;
  }

  return result.id;
}

export async function updateModule(moduleId: number, data: Partial<InsertCourseModule>): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { error } = await supabaseAdmin
    .from('courseModules')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', moduleId);

  if (error) {
    console.error("[Database] Error updating module:", error);
    throw error;
  }
}

export async function getModuleById(moduleId: number): Promise<CourseModule | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('courseModules')
    .select('*')
    .eq('id', moduleId)
    .single();

  if (error) return null;
  return data as CourseModule;
}

export async function deleteModule(moduleId: number, courseId: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  // Get lessons in module
  const { data: lessons } = await supabaseAdmin
    .from('courseLessons')
    .select('id')
    .eq('moduleId', moduleId);

  if (lessons && lessons.length > 0) {
    const lessonIds = lessons.map(l => l.id);
    await supabaseAdmin.from('lessonProgress').delete().in('lessonId', lessonIds);
    await supabaseAdmin.from('courseLessons').delete().eq('moduleId', moduleId);
  }

  // Delete module
  await supabaseAdmin.from('courseModules').delete().eq('id', moduleId);

  // Update course lesson count
  await updateCourseLessonCount(courseId);
}

export async function reorderModules(courseId: number, moduleIds: number[]): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  for (let i = 0; i < moduleIds.length; i++) {
    await supabaseAdmin
      .from('courseModules')
      .update({
        orderIndex: i,
        updatedAt: new Date().toISOString(),
      })
      .match({ id: moduleIds[i], courseId });
  }
}

// ============================================
// LESSON FUNCTIONS
// ============================================

export async function createLesson(data: InsertCourseLesson): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('courseLessons')
    .insert({
      ...data,
      lessonType: data.lessonType || 'video',
      isFree: data.isFree || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating lesson:", error);
    throw error;
  }

  // Update module and course counts
  await updateModuleLessonCount(data.moduleId);
  await updateCourseLessonCount(data.courseId);

  return result.id;
}

export async function updateLesson(lessonId: number, data: Partial<InsertCourseLesson>): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { error } = await supabaseAdmin
    .from('courseLessons')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', lessonId);

  if (error) {
    console.error("[Database] Error updating lesson:", error);
    throw error;
  }
}

export async function getLessonById(lessonId: number): Promise<CourseLesson | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('courseLessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error) return null;
  return data as CourseLesson;
}

export async function deleteLesson(lessonId: number, moduleId: number, courseId: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  // Delete progress
  await supabaseAdmin.from('lessonProgress').delete().eq('lessonId', lessonId);

  // Delete lesson
  await supabaseAdmin.from('courseLessons').delete().eq('id', lessonId);

  // Update counts
  await updateModuleLessonCount(moduleId);
  await updateCourseLessonCount(courseId);
}

export async function reorderLessons(moduleId: number, lessonIds: number[]): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  for (let i = 0; i < lessonIds.length; i++) {
    await supabaseAdmin
      .from('courseLessons')
      .update({
        orderIndex: i,
        updatedAt: new Date().toISOString(),
      })
      .match({ id: lessonIds[i], moduleId });
  }
}

async function updateModuleLessonCount(moduleId: number): Promise<void> {
  if (!supabaseAdmin) return;

  const { data: lessons } = await supabaseAdmin
    .from('courseLessons')
    .select('videoDurationSeconds')
    .eq('moduleId', moduleId);

  const count = lessons?.length || 0;
  const duration = (lessons || []).reduce((sum, l) => sum + (l.videoDurationSeconds || 0), 0);

  await supabaseAdmin
    .from('courseModules')
    .update({
      lessonsCount: count,
      durationMinutes: Math.ceil(duration / 60),
      updatedAt: new Date().toISOString(),
    })
    .eq('id', moduleId);
}

async function updateCourseLessonCount(courseId: number): Promise<void> {
  if (!supabaseAdmin) return;

  const { data: lessons } = await supabaseAdmin
    .from('courseLessons')
    .select('videoDurationSeconds')
    .eq('courseId', courseId);

  const count = lessons?.length || 0;
  const duration = (lessons || []).reduce((sum, l) => sum + (l.videoDurationSeconds || 0), 0);

  await supabaseAdmin
    .from('courses')
    .update({
      lessonsCount: count,
      totalDurationMinutes: Math.ceil(duration / 60),
      updatedAt: new Date().toISOString(),
    })
    .eq('id', courseId);
}

// ============================================
// ENROLLMENT FUNCTIONS
// ============================================

export async function createEnrollment(data: InsertCourseEnrollment): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('courseEnrollments')
    .insert({
      ...data,
      progressPercent: 0,
      completedLessonsCount: 0,
      lastAccessedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating enrollment:", error);
    throw error;
  }

  // Increment students count
  const { data: course } = await supabaseAdmin
    .from('courses')
    .select('studentsCount')
    .eq('id', data.courseId)
    .single();

  if (course) {
    await supabaseAdmin
      .from('courses')
      .update({
        studentsCount: (course.studentsCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', data.courseId);
  }

  return result.id;
}

export async function getEnrollment(courseId: number, userId: number): Promise<CourseEnrollment | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('courseEnrollments')
    .select('*')
    .match({ courseId, userId })
    .single();

  if (error) return null;
  return data as CourseEnrollment;
}

export async function getUserEnrollments(userId: number) {
  if (!supabaseAdmin) return [];

  const { data: enrollments, error } = await supabaseAdmin
    .from('courseEnrollments')
    .select('*')
    .eq('userId', userId)
    .order('lastAccessedAt', { ascending: false });

  if (error || !enrollments) return [];

  const courseIds = enrollments.map(e => e.courseId);
  const { data: courses } = await supabaseAdmin
    .from('courses')
    .select('*')
    .in('id', courseIds);

  const creatorIds = [...new Set((courses || []).map(c => c.creatorId))];
  const { data: creators } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName, avatarUrl')
    .in('id', creatorIds);

  const coursesMap = new Map((courses || []).map(c => [c.id, c]));
  const creatorsMap = new Map((creators || []).map(c => [c.id, c]));

  return enrollments.map(enrollment => {
    const course = coursesMap.get(enrollment.courseId);
    return {
      enrollment,
      course: course || null,
      creator: course ? (creatorsMap.get(course.creatorId) || { id: course.creatorId, displayName: 'Unknown', avatarUrl: null }) : null,
    };
  });
}

export async function updateEnrollmentProgress(enrollmentId: number, courseId: number): Promise<void> {
  if (!supabaseAdmin) return;

  // Get total lessons
  const { count: totalLessons } = await supabaseAdmin
    .from('courseLessons')
    .select('*', { count: 'exact', head: true })
    .eq('courseId', courseId);

  // Get completed lessons
  const { count: completedLessons } = await supabaseAdmin
    .from('lessonProgress')
    .select('*', { count: 'exact', head: true })
    .eq('enrollmentId', enrollmentId)
    .eq('isCompleted', true);

  const total = totalLessons || 0;
  const completed = completedLessons || 0;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  await supabaseAdmin
    .from('courseEnrollments')
    .update({
      progressPercent: progress,
      completedLessonsCount: completed,
      lastAccessedAt: new Date().toISOString(),
      completedAt: progress === 100 ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', enrollmentId);
}

// ============================================
// LESSON PROGRESS FUNCTIONS
// ============================================

export async function updateLessonProgress(
  lessonId: number,
  userId: number,
  enrollmentId: number,
  data: { watchedSeconds?: number; isCompleted?: boolean }
): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: existing } = await supabaseAdmin
    .from('lessonProgress')
    .select('*')
    .match({ lessonId, userId })
    .single();

  if (existing) {
    await supabaseAdmin
      .from('lessonProgress')
      .update({
        ...data,
        completedAt: data.isCompleted ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabaseAdmin
      .from('lessonProgress')
      .insert({
        lessonId,
        userId,
        enrollmentId,
        watchedSeconds: data.watchedSeconds || 0,
        isCompleted: data.isCompleted || false,
        completedAt: data.isCompleted ? new Date().toISOString() : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
  }

  // Get courseId from lesson and update enrollment
  const lesson = await getLessonById(lessonId);
  if (lesson) {
    await updateEnrollmentProgress(enrollmentId, lesson.courseId);
  }
}

export async function getLessonProgress(lessonId: number, userId: number): Promise<LessonProgress | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('lessonProgress')
    .select('*')
    .match({ lessonId, userId })
    .single();

  if (error) return null;
  return data as LessonProgress;
}

export async function getCourseProgress(enrollmentId: number) {
  if (!supabaseAdmin) return [];

  // Get enrollment to get courseId
  const { data: enrollment } = await supabaseAdmin
    .from('courseEnrollments')
    .select('courseId')
    .eq('id', enrollmentId)
    .single();

  if (!enrollment) return [];

  const { data: lessons } = await supabaseAdmin
    .from('courseLessons')
    .select('*')
    .eq('courseId', enrollment.courseId)
    .order('orderIndex', { ascending: true });

  if (!lessons) return [];

  const lessonIds = lessons.map(l => l.id);
  const { data: progressRecords } = await supabaseAdmin
    .from('lessonProgress')
    .select('*')
    .eq('enrollmentId', enrollmentId)
    .in('lessonId', lessonIds);

  const progressMap = new Map((progressRecords || []).map(p => [p.lessonId, p]));

  return lessons.map(lesson => ({
    lesson,
    progress: progressMap.get(lesson.id) || null,
  }));
}

// ============================================
// REVIEW FUNCTIONS
// ============================================

export async function createReview(data: InsertCourseReview): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('courseReviews')
    .insert({
      ...data,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating review:", error);
    throw error;
  }

  // Update course rating
  await updateCourseRating(data.courseId);

  return result.id;
}

export async function updateReview(reviewId: number, data: { rating?: number; title?: string; content?: string }): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { error } = await supabaseAdmin
    .from('courseReviews')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', reviewId);

  if (error) {
    console.error("[Database] Error updating review:", error);
    throw error;
  }

  // Get courseId and update rating
  const { data: review } = await supabaseAdmin
    .from('courseReviews')
    .select('courseId')
    .eq('id', reviewId)
    .single();

  if (review) {
    await updateCourseRating(review.courseId);
  }
}

export async function getCourseReviews(courseId: number, limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];

  const { data: reviews, error } = await supabaseAdmin
    .from('courseReviews')
    .select('*')
    .eq('courseId', courseId)
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !reviews) return [];

  const userIds = [...new Set(reviews.map(r => r.userId))];
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('id, name')
    .in('id', userIds);

  const usersMap = new Map((users || []).map(u => [u.id, u]));

  return reviews.map(review => ({
    review,
    user: usersMap.get(review.userId) || { id: review.userId, name: null },
  }));
}

async function updateCourseRating(courseId: number): Promise<void> {
  if (!supabaseAdmin) return;

  const { data: reviews } = await supabaseAdmin
    .from('courseReviews')
    .select('rating')
    .eq('courseId', courseId);

  const count = reviews?.length || 0;
  const avgRating = count > 0
    ? (reviews!.reduce((sum, r) => sum + r.rating, 0) / count).toFixed(2)
    : "0";

  await supabaseAdmin
    .from('courses')
    .update({
      averageRating: avgRating,
      reviewsCount: count,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', courseId);
}

// ============================================
// DIGITAL PRODUCTS FUNCTIONS
// ============================================

export async function createDigitalProduct(data: InsertDigitalProduct): Promise<number> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: result, error } = await supabaseAdmin
    .from('digitalProducts')
    .insert({
      ...data,
      status: data.status || 'draft',
      salesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) {
    console.error("[Database] Error creating digital product:", error);
    throw error;
  }

  return result.id;
}

export async function updateDigitalProduct(productId: number, data: Partial<InsertDigitalProduct>): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { error } = await supabaseAdmin
    .from('digitalProducts')
    .update({
      ...data,
      updatedAt: new Date().toISOString(),
    })
    .eq('id', productId);

  if (error) {
    console.error("[Database] Error updating digital product:", error);
    throw error;
  }
}

export async function deleteDigitalProduct(productId: number, creatorId: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  // Delete purchases
  await supabaseAdmin.from('digitalPurchases').delete().eq('productId', productId);

  // Delete product
  await supabaseAdmin.from('digitalProducts').delete().eq('id', productId);
}

export async function getDigitalProductById(productId: number): Promise<DigitalProduct | null> {
  if (!supabaseAdmin) return null;

  const { data, error } = await supabaseAdmin
    .from('digitalProducts')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) return null;
  return data as DigitalProduct;
}

export async function getDigitalProductBySlug(slug: string) {
  if (!supabaseAdmin) return null;

  const { data: product, error } = await supabaseAdmin
    .from('digitalProducts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !product) return null;

  const { data: creator } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName, avatarUrl')
    .eq('id', product.creatorId)
    .single();

  return {
    product,
    creator: creator || { id: product.creatorId, displayName: 'Unknown', avatarUrl: null },
  };
}

export async function getPublishedDigitalProducts(limit = 20, offset = 0) {
  if (!supabaseAdmin) return [];

  const { data: products, error } = await supabaseAdmin
    .from('digitalProducts')
    .select('*')
    .eq('status', 'published')
    .order('createdAt', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error || !products) return [];

  const creatorIds = [...new Set(products.map(p => p.creatorId))];
  const { data: creators } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName, avatarUrl')
    .in('id', creatorIds);

  const creatorsMap = new Map((creators || []).map(c => [c.id, c]));

  return products.map(product => ({
    product,
    creator: creatorsMap.get(product.creatorId) || { id: product.creatorId, displayName: 'Unknown', avatarUrl: null },
  }));
}

export async function getCreatorDigitalProducts(creatorId: number): Promise<DigitalProduct[]> {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('digitalProducts')
    .select('*')
    .eq('creatorId', creatorId)
    .order('createdAt', { ascending: false });

  if (error) return [];
  return (data || []) as DigitalProduct[];
}

export async function createDigitalPurchase(
  productId: number,
  userId: number,
  pricePaidCents: number,
  orderId?: number
): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  await supabaseAdmin
    .from('digitalPurchases')
    .insert({
      productId,
      userId,
      pricePaidCents,
      orderId: orderId || null,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
    });

  // Increment sales count
  const { data: product } = await supabaseAdmin
    .from('digitalProducts')
    .select('salesCount')
    .eq('id', productId)
    .single();

  if (product) {
    await supabaseAdmin
      .from('digitalProducts')
      .update({
        salesCount: (product.salesCount || 0) + 1,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', productId);
  }
}

export async function getUserDigitalPurchases(userId: number) {
  if (!supabaseAdmin) return [];

  const { data: purchases, error } = await supabaseAdmin
    .from('digitalPurchases')
    .select('*')
    .eq('userId', userId)
    .order('createdAt', { ascending: false });

  if (error || !purchases) return [];

  const productIds = purchases.map(p => p.productId);
  const { data: products } = await supabaseAdmin
    .from('digitalProducts')
    .select('*')
    .in('id', productIds);

  const creatorIds = [...new Set((products || []).map(p => p.creatorId))];
  const { data: creators } = await supabaseAdmin
    .from('creatorProfiles')
    .select('id, displayName')
    .in('id', creatorIds);

  const productsMap = new Map((products || []).map(p => [p.id, p]));
  const creatorsMap = new Map((creators || []).map(c => [c.id, c]));

  return purchases.map(purchase => {
    const product = productsMap.get(purchase.productId);
    return {
      purchase,
      product: product || null,
      creator: product ? (creatorsMap.get(product.creatorId) || { id: product.creatorId, displayName: 'Unknown' }) : null,
    };
  });
}

export async function hasUserPurchasedProduct(productId: number, userId: number): Promise<boolean> {
  if (!supabaseAdmin) return false;

  const { data, error } = await supabaseAdmin
    .from('digitalPurchases')
    .select('id')
    .match({ productId, userId })
    .single();

  return !error && !!data;
}

export async function incrementDownloadCount(purchaseId: number): Promise<void> {
  if (!supabaseAdmin) throw new Error("Database not available");

  const { data: purchase } = await supabaseAdmin
    .from('digitalPurchases')
    .select('downloadCount')
    .eq('id', purchaseId)
    .single();

  if (purchase) {
    await supabaseAdmin
      .from('digitalPurchases')
      .update({
        downloadCount: (purchase.downloadCount || 0) + 1,
        lastDownloadedAt: new Date().toISOString(),
      })
      .eq('id', purchaseId);
  }
}
