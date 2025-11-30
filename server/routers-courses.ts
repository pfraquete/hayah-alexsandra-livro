import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getCreatorProfileByUserId } from "./db-social";
import {
  createCourse,
  updateCourse,
  getCourseById,
  getCourseBySlug,
  getCourseWithModules,
  getPublishedCourses,
  getFeaturedCourses,
  getCreatorCourses,
  deleteCourse,
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  createEnrollment,
  getEnrollment,
  getUserEnrollments,
  updateLessonProgress,
  getLessonProgress,
  getCourseProgress,
  createReview,
  updateReview,
  getCourseReviews,
  createDigitalProduct,
  updateDigitalProduct,
  getDigitalProductBySlug,
  getPublishedDigitalProducts,
  getCreatorDigitalProducts,
  createDigitalPurchase,
  getUserDigitalPurchases,
  hasUserPurchasedProduct,
  incrementDownloadCount,
  deleteDigitalProduct,
  getDigitalProductById,
  getModuleById,
  getLessonById,
} from "./db-courses";

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
}

// Courses Router
export const coursesRouter = router({
  // Get published courses (public)
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return await getPublishedCourses(input.limit, input.offset);
    }),

  // Get featured courses
  featured: publicProcedure
    .input(z.object({ limit: z.number().min(1).max(12).default(6) }))
    .query(async ({ input }) => {
      return await getFeaturedCourses(input.limit);
    }),

  // Get course by slug (public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const course = await getCourseBySlug(input.slug);
      if (!course) return null;

      // Check if user is enrolled
      let enrollment = null;
      if (ctx.user) {
        enrollment = await getEnrollment(course.course.id, ctx.user.id);
      }

      return { ...course, enrollment };
    }),

  // Get course with all modules and lessons
  getWithContent: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input, ctx }) => {
      const course = await getCourseWithModules(input.courseId);
      if (!course) {
        throw new Error("Curso não encontrado");
      }

      // Check enrollment
      const enrollment = await getEnrollment(input.courseId, ctx.user.id);
      if (!enrollment) {
        // Only show free lessons if not enrolled
        const modulesWithFreeLessons = course.modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({
            ...lesson,
            videoUrl: lesson.isFree ? lesson.videoUrl : null,
            content: lesson.isFree ? lesson.content : null,
            downloadUrl: lesson.isFree ? lesson.downloadUrl : null,
          })),
        }));
        return { ...course, modules: modulesWithFreeLessons, enrollment: null };
      }

      // Get progress for enrolled users
      const progress = await getCourseProgress(enrollment.id);

      return { ...course, enrollment, progress };
    }),

  // Create course (creator only)
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(255),
        description: z.string().optional(),
        shortDescription: z.string().max(500).optional(),
        thumbnailUrl: z.string().max(500).optional(),
        previewVideoUrl: z.string().max(500).optional(),
        priceCents: z.number().min(0),
        compareAtPriceCents: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || profile.status !== "approved") {
        throw new Error("Você precisa ser uma criadora aprovada para criar cursos");
      }

      const slug = generateSlug(input.title) + "-" + Date.now().toString(36);

      const courseId = await createCourse({
        creatorId: profile.id,
        ...input,
        slug,
        status: "draft",
      });

      return { success: true, courseId, slug };
    }),

  // Update course
  update: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        title: z.string().min(3).max(255).optional(),
        description: z.string().optional(),
        shortDescription: z.string().max(500).optional(),
        thumbnailUrl: z.string().max(500).optional(),
        previewVideoUrl: z.string().max(500).optional(),
        priceCents: z.number().min(0).optional(),
        compareAtPriceCents: z.number().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        isFeatured: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new Error("Perfil não encontrado");
      }

      const course = await getCourseById(input.courseId);
      const isAdmin = ctx.user.role === 'admin';
      if (!course || (!isAdmin && course.creatorId !== profile.id)) {
        throw new Error("Curso não encontrado ou você não tem permissão");
      }

      const { courseId, ...data } = input;

      // Set publishedAt when publishing
      if (data.status === "published" && course.status !== "published") {
        await updateCourse(courseId, { ...data, publishedAt: new Date() });
      } else {
        await updateCourse(courseId, data);
      }

      return { success: true };
    }),

  // Delete course
  delete: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new Error("Perfil não encontrado");
      }

      const course = await getCourseById(input.courseId);
      const isAdmin = ctx.user.role === 'admin';
      if (!course || (!isAdmin && course.creatorId !== profile.id)) {
        throw new Error("Curso não encontrado ou você não tem permissão");
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
  }),
});

// Modules Router
export const modulesRouter = router({
  // Create module
  create: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        orderIndex: z.number().default(0),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new Error("Perfil não encontrado");
      }

      const course = await getCourseById(input.courseId);
      const isAdmin = ctx.user.role === 'admin';
      if (!course || (!isAdmin && course.creatorId !== profile.id)) {
        throw new Error("Curso não encontrado ou você não tem permissão");
      }

      const moduleId = await createModule(input);
      return { success: true, moduleId };
    }),

  // Update module
  update: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
      courseId: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      orderIndex: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { moduleId, courseId, ...data } = input;

      const module = await getModuleById(moduleId);
      if (!module) throw new Error("Módulo não encontrado");
      if (module.courseId !== courseId) throw new Error("Módulo não pertence ao curso");

      const course = await getCourseById(courseId);
      const isAdmin = ctx.user.role === 'admin';

      if (!course) throw new Error("Curso não encontrado");

      if (!isAdmin) {
        const profile = await getCreatorProfileByUserId(ctx.user.id);
        if (!profile || course.creatorId !== profile.id) {
          throw new Error("Você não tem permissão");
        }
      }

      await updateModule(moduleId, data);
      return { success: true };
    }),

  // Delete module
  delete: protectedProcedure
    .input(z.object({ moduleId: z.number(), courseId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { moduleId, courseId } = input;

      const module = await getModuleById(moduleId);
      if (!module) throw new Error("Módulo não encontrado");
      if (module.courseId !== courseId) throw new Error("Módulo não pertence ao curso");

      const course = await getCourseById(courseId);
      const isAdmin = ctx.user.role === 'admin';

      if (!course) throw new Error("Curso não encontrado");

      if (!isAdmin) {
        const profile = await getCreatorProfileByUserId(ctx.user.id);
        if (!profile || course.creatorId !== profile.id) {
          throw new Error("Você não tem permissão");
        }
      }

      await deleteModule(moduleId, courseId);
      return { success: true };
    }),

  // Reorder modules
  reorder: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        moduleIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      await reorderModules(input.courseId, input.moduleIds);
      return { success: true };
    }),
});

// Lessons Router
export const lessonsRouter = router({
  // Get lesson by ID
  getById: protectedProcedure
    .input(z.object({ lessonId: z.number() }))
    .query(async ({ input, ctx }) => {
      const lesson = await getLessonById(input.lessonId);
      if (!lesson) {
        throw new Error("Aula não encontrada");
      }

      // Check enrollment
      const enrollment = await getEnrollment(lesson.courseId, ctx.user.id);

      // Check if creator
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      const course = await getCourseById(lesson.courseId);
      const isCreator = profile && course && course.creatorId === profile.id;

      if (!enrollment && !isCreator && !lesson.isFree) {
        throw new Error("Você precisa estar matriculado para acessar esta aula");
      }

      // Get progress
      let progress = null;
      if (enrollment) {
        progress = await getLessonProgress(input.lessonId, ctx.user.id);
      }

      return { lesson, progress, enrollment };
    }),

  // Create lesson
  create: protectedProcedure
    .input(
      z.object({
        moduleId: z.number(),
        courseId: z.number(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        lessonType: z.enum(["video", "text", "quiz", "download"]).default("video"),
        videoUrl: z.string().max(500).optional(),
        videoDurationSeconds: z.number().optional(),
        content: z.string().optional(),
        downloadUrl: z.string().max(500).optional(),
        orderIndex: z.number().default(0),
        isFree: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile) {
        throw new Error("Perfil não encontrado");
      }

      const course = await getCourseById(input.courseId);
      const isAdmin = ctx.user.role === 'admin';
      if (!course || (!isAdmin && course.creatorId !== profile.id)) {
        throw new Error("Curso não encontrado ou você não tem permissão");
      }

      const lessonId = await createLesson(input);
      return { success: true, lessonId };
    }),

  // Update lesson
  update: protectedProcedure
    .input(z.object({
      lessonId: z.number(),
      courseId: z.number(),
      moduleId: z.number().optional(),
      title: z.string().optional(),
      description: z.string().optional(),
      lessonType: z.enum(["video", "text", "quiz", "download"]).optional(),
      videoUrl: z.string().optional(),
      videoDurationSeconds: z.number().optional(),
      content: z.string().optional(),
      downloadUrl: z.string().optional(),
      isFree: z.boolean().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { lessonId, courseId, ...data } = input;

      const lesson = await getLessonById(lessonId);
      if (!lesson) throw new Error("Aula não encontrada");

      const module = await getModuleById(lesson.moduleId);
      if (!module || module.courseId !== courseId) throw new Error("Aula não pertence ao curso");

      const course = await getCourseById(courseId);
      const isAdmin = ctx.user.role === 'admin';

      if (!course) throw new Error("Curso não encontrado");

      if (!isAdmin) {
        const profile = await getCreatorProfileByUserId(ctx.user.id);
        if (!profile || course.creatorId !== profile.id) {
          throw new Error("Você não tem permissão");
        }
      }

      await updateLesson(lessonId, data);
      return { success: true };
    }),

  // Delete lesson
  delete: protectedProcedure
    .input(z.object({ lessonId: z.number(), moduleId: z.number(), courseId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { lessonId, moduleId, courseId } = input;

      const lesson = await getLessonById(lessonId);
      if (!lesson) throw new Error("Aula não encontrada");
      if (lesson.moduleId !== moduleId) throw new Error("Aula não pertence ao módulo");

      const module = await getModuleById(moduleId);
      if (!module || module.courseId !== courseId) throw new Error("Módulo não pertence ao curso");

      const course = await getCourseById(courseId);
      const isAdmin = ctx.user.role === 'admin';

      if (!course) throw new Error("Curso não encontrado");

      if (!isAdmin) {
        const profile = await getCreatorProfileByUserId(ctx.user.id);
        if (!profile || course.creatorId !== profile.id) {
          throw new Error("Você não tem permissão");
        }
      }

      await deleteLesson(lessonId, moduleId, courseId);
      return { success: true };
    }),

  // Reorder lessons
  reorder: protectedProcedure
    .input(
      z.object({
        moduleId: z.number(),
        lessonIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      await reorderLessons(input.moduleId, input.lessonIds);
      return { success: true };
    }),

  // Update progress
  updateProgress: protectedProcedure
    .input(
      z.object({
        lessonId: z.number(),
        watchedSeconds: z.number().optional(),
        isCompleted: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lesson = await getLessonById(input.lessonId);
      if (!lesson) {
        throw new Error("Aula não encontrada");
      }

      const enrollment = await getEnrollment(lesson.courseId, ctx.user.id);
      if (!enrollment) {
        throw new Error("Você não está matriculado neste curso");
      }

      await updateLessonProgress(
        input.lessonId,
        ctx.user.id,
        enrollment.id,
        {
          watchedSeconds: input.watchedSeconds,
          isCompleted: input.isCompleted,
        }
      );

      return { success: true };
    }),
});

// Enrollments Router
export const enrollmentsRouter = router({
  // Get user's enrollments
  myEnrollments: protectedProcedure.query(async ({ ctx }) => {
    return await getUserEnrollments(ctx.user.id);
  }),

  // Check enrollment status
  check: protectedProcedure
    .input(z.object({ courseId: z.number() }))
    .query(async ({ input, ctx }) => {
      return await getEnrollment(input.courseId, ctx.user.id);
    }),

  // Enroll in a course (for now, direct enrollment - can add payment later)
  enroll: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        orderId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const course = await getCourseById(input.courseId);
      if (!course) {
        throw new Error("Curso não encontrado");
      }

      if (course.status !== "published") {
        throw new Error("Este curso não está disponível para matrícula");
      }

      // Check if already enrolled
      const existing = await getEnrollment(input.courseId, ctx.user.id);
      if (existing) {
        throw new Error("Você já está matriculado neste curso");
      }

      const enrollmentId = await createEnrollment({
        courseId: input.courseId,
        userId: ctx.user.id,
        orderId: input.orderId,
        pricePaidCents: course.priceCents,
      });

      return { success: true, enrollmentId };
    }),
});

// Reviews Router
export const reviewsRouter = router({
  // Get course reviews
  list: publicProcedure
    .input(
      z.object({
        courseId: z.number(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return await getCourseReviews(input.courseId, input.limit, input.offset);
    }),

  // Create review
  create: protectedProcedure
    .input(
      z.object({
        courseId: z.number(),
        rating: z.number().min(1).max(5),
        title: z.string().max(255).optional(),
        content: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const enrollment = await getEnrollment(input.courseId, ctx.user.id);
      if (!enrollment) {
        throw new Error("Você precisa estar matriculado para avaliar");
      }

      const reviewId = await createReview({
        courseId: input.courseId,
        userId: ctx.user.id,
        enrollmentId: enrollment.id,
        rating: input.rating,
        title: input.title,
        content: input.content,
      });

      return { success: true, reviewId };
    }),

  // Update review
  update: protectedProcedure
    .input(
      z.object({
        reviewId: z.number(),
        rating: z.number().min(1).max(5).optional(),
        title: z.string().max(255).optional(),
        content: z.string().max(2000).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { reviewId, ...data } = input;
      await updateReview(reviewId, data);
      return { success: true };
    }),
});

// Digital Products Router
export const digitalProductsRouter = router({
  // List published digital products
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return await getPublishedDigitalProducts(input.limit, input.offset);
    }),

  // Get by slug
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const product = await getDigitalProductBySlug(input.slug);
      if (!product) return null;

      let hasPurchased = false;
      if (ctx.user) {
        hasPurchased = await hasUserPurchasedProduct(product.product.id, ctx.user.id);
      }

      return { ...product, hasPurchased };
    }),

  // Create digital product
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(3).max(255),
        description: z.string().optional(),
        shortDescription: z.string().max(500).optional(),
        thumbnailUrl: z.string().max(500).optional(),
        previewUrl: z.string().max(500).optional(),
        fileUrl: z.string().max(500),
        fileType: z.string().max(50),
        fileSizeBytes: z.number().optional(),
        priceCents: z.number().min(0),
        compareAtPriceCents: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const profile = await getCreatorProfileByUserId(ctx.user.id);
      if (!profile || profile.status !== "approved") {
        throw new Error("Você precisa ser uma criadora aprovada");
      }

      const slug = generateSlug(input.title) + "-" + Date.now().toString(36);

      const productId = await createDigitalProduct({
        creatorId: profile.id,
        ...input,
        slug,
        status: "draft",
      });

      return { success: true, productId, slug };
    }),

  // Update digital product
  update: protectedProcedure
    .input(
      z.object({
        productId: z.number(),
        title: z.string().min(3).max(255).optional(),
        description: z.string().optional(),
        shortDescription: z.string().max(500).optional(),
        thumbnailUrl: z.string().max(500).optional(),
        previewUrl: z.string().max(500).optional(),
        fileUrl: z.string().max(500).optional(),
        fileType: z.string().max(50).optional(),
        fileSizeBytes: z.number().optional(),
        priceCents: z.number().min(0).optional(),
        compareAtPriceCents: z.number().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { productId, ...data } = input;

      const product = await getDigitalProductById(productId);
      if (!product) throw new Error("Produto não encontrado");

      const isAdmin = ctx.user.role === 'admin';
      if (!isAdmin) {
        const profile = await getCreatorProfileByUserId(ctx.user.id);
        if (!profile || product.creatorId !== profile.id) {
          throw new Error("Você não tem permissão");
        }
      }

      await updateDigitalProduct(productId, data);
      return { success: true };
    }),

  // Delete digital product
  delete: protectedProcedure
    .input(z.object({ productId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const product = await getDigitalProductById(input.productId);
      if (!product) throw new Error("Produto não encontrado");

      const isAdmin = ctx.user.role === 'admin';
      if (!isAdmin) {
        const profile = await getCreatorProfileByUserId(ctx.user.id);
        if (!profile || product.creatorId !== profile.id) {
          throw new Error("Você não tem permissão");
        }
        await deleteDigitalProduct(input.productId, profile.id);
      } else {
        // Admin delete - pass 0 as creatorId since it's ignored or we can pass product.creatorId
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
    return await getUserDigitalPurchases(ctx.user.id);
  }),

  // Purchase digital product
  purchase: protectedProcedure
    .input(z.object({ productId: z.number(), orderId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      const product = await getDigitalProductBySlug("");
      // This is a simplified purchase - in production, integrate with payment
      await createDigitalPurchase(
        input.productId,
        ctx.user.id,
        0, // Price should come from actual product
        input.orderId
      );
      return { success: true };
    }),

  // Download purchased product
  download: protectedProcedure
    .input(z.object({ purchaseId: z.number() }))
    .mutation(async ({ input }) => {
      await incrementDownloadCount(input.purchaseId);
      // Return download URL - in production, generate signed URL
      return { success: true };
    }),
});

// Combined Marketplace Router
export const marketplaceRouter = router({
  courses: coursesRouter,
  modules: modulesRouter,
  lessons: lessonsRouter,
  enrollments: enrollmentsRouter,
  reviews: reviewsRouter,
  digitalProducts: digitalProductsRouter,
});
