CREATE TYPE "public"."course_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."creator_status" AS ENUM('pending', 'approved', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."lesson_type" AS ENUM('video', 'text', 'quiz', 'download');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('AGUARDANDO_PAGAMENTO', 'PAGO', 'EM_SEPARACAO', 'POSTADO', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADO', 'REEMBOLSADO');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'authorized', 'paid', 'refunded', 'failed', 'canceled');--> statement-breakpoint
CREATE TYPE "public"."post_visibility" AS ENUM('public', 'followers', 'private');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."shipment_status" AS ENUM('PENDENTE', 'ETIQUETA_GERADA', 'POSTADO', 'EM_TRANSITO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'DEVOLVIDO');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"recipientName" varchar(255) NOT NULL,
	"cep" varchar(10) NOT NULL,
	"street" varchar(255) NOT NULL,
	"number" varchar(20) NOT NULL,
	"complement" varchar(100),
	"district" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(2) NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "commentLikes" (
	"id" serial PRIMARY KEY NOT NULL,
	"commentId" integer NOT NULL,
	"userId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_comment_like" UNIQUE("commentId","userId")
);
--> statement-breakpoint
CREATE TABLE "courseEnrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" integer NOT NULL,
	"userId" integer NOT NULL,
	"orderId" integer,
	"pricePaidCents" integer NOT NULL,
	"progressPercent" integer DEFAULT 0 NOT NULL,
	"completedLessonsCount" integer DEFAULT 0 NOT NULL,
	"lastAccessedAt" timestamp,
	"completedAt" timestamp,
	"certificateUrl" varchar(500),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_enrollment" UNIQUE("courseId","userId")
);
--> statement-breakpoint
CREATE TABLE "courseLessons" (
	"id" serial PRIMARY KEY NOT NULL,
	"moduleId" integer NOT NULL,
	"courseId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"lessonType" "lesson_type" DEFAULT 'video' NOT NULL,
	"videoUrl" varchar(500),
	"videoDurationSeconds" integer,
	"content" text,
	"downloadUrl" varchar(500),
	"orderIndex" integer DEFAULT 0 NOT NULL,
	"isFree" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courseModules" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"orderIndex" integer DEFAULT 0 NOT NULL,
	"lessonsCount" integer DEFAULT 0 NOT NULL,
	"durationMinutes" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courseReviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"courseId" integer NOT NULL,
	"userId" integer NOT NULL,
	"enrollmentId" integer NOT NULL,
	"rating" integer NOT NULL,
	"title" varchar(255),
	"content" text,
	"isVerified" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_review" UNIQUE("courseId","userId")
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"creatorId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"shortDescription" varchar(500),
	"thumbnailUrl" varchar(500),
	"previewVideoUrl" varchar(500),
	"priceCents" integer NOT NULL,
	"compareAtPriceCents" integer,
	"status" "course_status" DEFAULT 'draft' NOT NULL,
	"totalDurationMinutes" integer DEFAULT 0 NOT NULL,
	"lessonsCount" integer DEFAULT 0 NOT NULL,
	"studentsCount" integer DEFAULT 0 NOT NULL,
	"averageRating" numeric(3, 2) DEFAULT '0',
	"reviewsCount" integer DEFAULT 0 NOT NULL,
	"isFeatured" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"publishedAt" timestamp,
	CONSTRAINT "courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "creatorProfiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"displayName" varchar(100) NOT NULL,
	"bio" text,
	"avatarUrl" varchar(500),
	"coverUrl" varchar(500),
	"instagram" varchar(100),
	"youtube" varchar(100),
	"website" varchar(255),
	"status" "creator_status" DEFAULT 'pending' NOT NULL,
	"followersCount" integer DEFAULT 0 NOT NULL,
	"postsCount" integer DEFAULT 0 NOT NULL,
	"coursesCount" integer DEFAULT 0 NOT NULL,
	"totalEarningsCents" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creatorProfiles_userId_unique" UNIQUE("userId")
);
--> statement-breakpoint
CREATE TABLE "digitalProducts" (
	"id" serial PRIMARY KEY NOT NULL,
	"creatorId" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"shortDescription" varchar(500),
	"thumbnailUrl" varchar(500),
	"previewUrl" varchar(500),
	"fileUrl" varchar(500) NOT NULL,
	"fileType" varchar(50) NOT NULL,
	"fileSizeBytes" integer,
	"priceCents" integer NOT NULL,
	"compareAtPriceCents" integer,
	"status" "course_status" DEFAULT 'draft' NOT NULL,
	"salesCount" integer DEFAULT 0 NOT NULL,
	"averageRating" numeric(3, 2) DEFAULT '0',
	"reviewsCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"publishedAt" timestamp,
	CONSTRAINT "digitalProducts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "digitalPurchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"productId" integer NOT NULL,
	"userId" integer NOT NULL,
	"orderId" integer,
	"pricePaidCents" integer NOT NULL,
	"downloadCount" integer DEFAULT 0 NOT NULL,
	"lastDownloadedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_purchase" UNIQUE("productId","userId")
);
--> statement-breakpoint
CREATE TABLE "followers" (
	"id" serial PRIMARY KEY NOT NULL,
	"followerId" integer NOT NULL,
	"followingId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_follow" UNIQUE("followerId","followingId")
);
--> statement-breakpoint
CREATE TABLE "lessonProgress" (
	"id" serial PRIMARY KEY NOT NULL,
	"lessonId" integer NOT NULL,
	"userId" integer NOT NULL,
	"enrollmentId" integer NOT NULL,
	"isCompleted" boolean DEFAULT false NOT NULL,
	"watchedSeconds" integer DEFAULT 0 NOT NULL,
	"completedAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_progress" UNIQUE("lessonId","userId")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text,
	"linkUrl" varchar(500),
	"isRead" boolean DEFAULT false NOT NULL,
	"metadata" json,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orderItems" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"productId" integer NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unitPriceCents" integer NOT NULL,
	"totalPriceCents" integer NOT NULL,
	"productName" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"addressId" integer,
	"subtotalCents" integer NOT NULL,
	"shippingPriceCents" integer NOT NULL,
	"discountCents" integer DEFAULT 0 NOT NULL,
	"totalCents" integer NOT NULL,
	"status" "order_status" DEFAULT 'AGUARDANDO_PAGAMENTO' NOT NULL,
	"paymentMethod" varchar(50),
	"shippingAddress" json,
	"customerNotes" text,
	"adminNotes" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"paidAt" timestamp,
	"shippedAt" timestamp,
	"deliveredAt" timestamp,
	"cancelledAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "paymentTransactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"externalId" varchar(100),
	"gateway" varchar(50) DEFAULT 'pagarme' NOT NULL,
	"method" varchar(50) NOT NULL,
	"amountCents" integer NOT NULL,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"gatewayResponse" json,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postComments" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"userId" integer NOT NULL,
	"parentId" integer,
	"content" text NOT NULL,
	"likesCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "postLikes" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"userId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "unique_like" UNIQUE("postId","userId")
);
--> statement-breakpoint
CREATE TABLE "postMedia" (
	"id" serial PRIMARY KEY NOT NULL,
	"postId" integer NOT NULL,
	"mediaUrl" varchar(500) NOT NULL,
	"mediaType" varchar(20) NOT NULL,
	"thumbnailUrl" varchar(500),
	"orderIndex" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"creatorId" integer NOT NULL,
	"content" text,
	"visibility" "post_visibility" DEFAULT 'public' NOT NULL,
	"likesCount" integer DEFAULT 0 NOT NULL,
	"commentsCount" integer DEFAULT 0 NOT NULL,
	"sharesCount" integer DEFAULT 0 NOT NULL,
	"isPinned" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"priceCents" integer NOT NULL,
	"compareAtPriceCents" integer,
	"stockQuantity" integer DEFAULT 0 NOT NULL,
	"weightGrams" integer DEFAULT 300 NOT NULL,
	"widthCm" numeric(5, 2) DEFAULT '14' NOT NULL,
	"heightCm" numeric(5, 2) DEFAULT '21' NOT NULL,
	"depthCm" numeric(5, 2) DEFAULT '2' NOT NULL,
	"imageUrl" varchar(500),
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "shipments" (
	"id" serial PRIMARY KEY NOT NULL,
	"orderId" integer NOT NULL,
	"shippingMethod" varchar(50) NOT NULL,
	"shippingPriceCents" integer NOT NULL,
	"trackingCode" varchar(50),
	"trackingUrl" varchar(500),
	"status" "shipment_status" DEFAULT 'PENDENTE' NOT NULL,
	"labelUrl" varchar(500),
	"estimatedDeliveryDays" integer,
	"postedAt" timestamp,
	"deliveredAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "shipments_orderId_unique" UNIQUE("orderId")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"phone" varchar(20),
	"cpf" varchar(14),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE INDEX "user_id_idx" ON "addresses" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "clike_comment_id_idx" ON "commentLikes" USING btree ("commentId");--> statement-breakpoint
CREATE INDEX "clike_user_id_idx" ON "commentLikes" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "enrollment_course_id_idx" ON "courseEnrollments" USING btree ("courseId");--> statement-breakpoint
CREATE INDEX "enrollment_user_id_idx" ON "courseEnrollments" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "lesson_module_id_idx" ON "courseLessons" USING btree ("moduleId");--> statement-breakpoint
CREATE INDEX "lesson_course_id_idx" ON "courseLessons" USING btree ("courseId");--> statement-breakpoint
CREATE INDEX "module_course_id_idx" ON "courseModules" USING btree ("courseId");--> statement-breakpoint
CREATE INDEX "review_course_id_idx" ON "courseReviews" USING btree ("courseId");--> statement-breakpoint
CREATE INDEX "review_user_id_idx" ON "courseReviews" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "course_creator_id_idx" ON "courses" USING btree ("creatorId");--> statement-breakpoint
CREATE INDEX "course_slug_idx" ON "courses" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "course_status_idx" ON "courses" USING btree ("status");--> statement-breakpoint
CREATE INDEX "creator_user_id_idx" ON "creatorProfiles" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "creator_status_idx" ON "creatorProfiles" USING btree ("status");--> statement-breakpoint
CREATE INDEX "digital_creator_id_idx" ON "digitalProducts" USING btree ("creatorId");--> statement-breakpoint
CREATE INDEX "digital_slug_idx" ON "digitalProducts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "digital_status_idx" ON "digitalProducts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "purchase_product_id_idx" ON "digitalPurchases" USING btree ("productId");--> statement-breakpoint
CREATE INDEX "purchase_user_id_idx" ON "digitalPurchases" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "follower_id_idx" ON "followers" USING btree ("followerId");--> statement-breakpoint
CREATE INDEX "following_id_idx" ON "followers" USING btree ("followingId");--> statement-breakpoint
CREATE INDEX "progress_lesson_id_idx" ON "lessonProgress" USING btree ("lessonId");--> statement-breakpoint
CREATE INDEX "progress_user_id_idx" ON "lessonProgress" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "progress_enrollment_id_idx" ON "lessonProgress" USING btree ("enrollmentId");--> statement-breakpoint
CREATE INDEX "notification_user_id_idx" ON "notifications" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "notification_is_read_idx" ON "notifications" USING btree ("isRead");--> statement-breakpoint
CREATE INDEX "notification_created_at_idx" ON "notifications" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "orders_user_id_idx" ON "orders" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "comment_post_id_idx" ON "postComments" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "comment_user_id_idx" ON "postComments" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "comment_parent_id_idx" ON "postComments" USING btree ("parentId");--> statement-breakpoint
CREATE INDEX "like_post_id_idx" ON "postLikes" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "like_user_id_idx" ON "postLikes" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "media_post_id_idx" ON "postMedia" USING btree ("postId");--> statement-breakpoint
CREATE INDEX "post_creator_id_idx" ON "posts" USING btree ("creatorId");--> statement-breakpoint
CREATE INDEX "post_created_at_idx" ON "posts" USING btree ("createdAt");--> statement-breakpoint
CREATE INDEX "post_visibility_idx" ON "posts" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "active_idx" ON "products" USING btree ("active");