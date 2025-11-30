import { useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import CommunityLayout from "@/components/CommunityLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Star,
  Clock,
  Users,
  BookOpen,
  Play,
  CheckCircle2,
  Lock,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function CourseDetails() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [, params] = useRoute("/curso/:slug");
  const slug = params?.slug || "";

  const { data: courseData, isLoading } = trpc.marketplace.courses.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: fullCourse } = trpc.marketplace.courses.getWithContent.useQuery(
    { courseId: courseData?.course.id || 0 },
    { enabled: !!courseData?.course.id }
  );

  const { data: reviews } = trpc.marketplace.reviews.list.useQuery(
    { courseId: courseData?.course.id || 0, limit: 5 },
    { enabled: !!courseData?.course.id }
  );

  const enrollMutation = trpc.marketplace.enrollments.enroll.useMutation();

  const handleEnroll = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!courseData?.course.id) return;

    try {
      await enrollMutation.mutateAsync({ courseId: courseData.course.id });
      toast.success("Matricula realizada com sucesso!");
      navigate(`/curso/${slug}/assistir`);
    } catch (error: any) {
      toast.error(error.message || "Erro ao realizar matricula");
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  if (isLoading) {
    return (
      <CommunityLayout>
        <div className="max-w-6xl mx-auto p-4">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Skeleton className="aspect-video w-full rounded-lg" />
              <Skeleton className="h-10 w-3/4 mt-4" />
              <Skeleton className="h-4 w-full mt-4" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </div>
            <div>
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </CommunityLayout>
    );
  }

  if (!courseData) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto p-4">
          <Card className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Curso nao encontrado</h2>
            <p className="text-muted-foreground mb-4">
              Este curso nao existe ou foi removido
            </p>
            <Link href="/marketplace">
              <Button>Ver Marketplace</Button>
            </Link>
          </Card>
        </div>
      </CommunityLayout>
    );
  }

  const { course, creator, enrollment } = courseData;
  const discount = course.compareAtPriceCents
    ? Math.round(((course.compareAtPriceCents - course.priceCents) / course.compareAtPriceCents) * 100)
    : 0;

  return (
    <CommunityLayout>
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Preview Video/Image */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
              {course.previewVideoUrl ? (
                <video
                  src={course.previewVideoUrl}
                  poster={course.thumbnailUrl || undefined}
                  className="w-full h-full object-cover"
                  controls
                />
              ) : course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                </div>
              )}
            </div>

            {/* Title & Meta */}
            <h1 className="text-3xl font-bold mt-6">{course.title}</h1>

            <p className="text-lg text-muted-foreground mt-2">
              {course.shortDescription}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-4">
              {course.averageRating && parseFloat(course.averageRating) > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{parseFloat(course.averageRating).toFixed(1)}</span>
                  <span className="text-muted-foreground">
                    ({course.reviewsCount} avaliacoes)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-5 w-5" />
                <span>{course.studentsCount} alunas</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-5 w-5" />
                <span>{formatDuration(course.totalDurationMinutes)}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <BookOpen className="h-5 w-5" />
                <span>{course.lessonsCount} aulas</span>
              </div>
            </div>

            {/* Creator */}
            <Link href={`/comunidade/criadora/${creator.id}`}>
              <div className="flex items-center gap-3 mt-6 p-4 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={creator.avatarUrl || undefined} />
                  <AvatarFallback>{creator.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Criado por</p>
                  <p className="font-semibold">{creator.displayName}</p>
                </div>
              </div>
            </Link>

            <Separator className="my-8" />

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Sobre o Curso</h2>
              <div className="prose prose-sm max-w-none">
                {course.description ? (
                  <p className="whitespace-pre-wrap">{course.description}</p>
                ) : (
                  <p className="text-muted-foreground">
                    Descricao nao disponivel
                  </p>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Curriculum */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Conteudo do Curso</h2>
              <p className="text-muted-foreground mb-4">
                {fullCourse?.modules?.length || 0} modulos - {course.lessonsCount} aulas -{" "}
                {formatDuration(course.totalDurationMinutes)} de conteudo
              </p>

              <Accordion type="multiple" className="w-full">
                {fullCourse?.modules?.map((module, index) => (
                  <AccordionItem key={module.id} value={`module-${module.id}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 text-left">
                        <span className="text-sm text-muted-foreground">
                          Modulo {index + 1}
                        </span>
                        <span className="font-semibold">{module.title}</span>
                        <Badge variant="secondary" className="ml-auto mr-4">
                          {module.lessonsCount} aulas
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-4">
                        {module.lessons?.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 p-2 rounded-lg"
                          >
                            {lesson.isFree || enrollment ? (
                              <Play className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm flex-1">{lesson.title}</span>
                            {lesson.isFree && (
                              <Badge variant="outline" className="text-xs">
                                Gratis
                              </Badge>
                            )}
                            {lesson.videoDurationSeconds && (
                              <span className="text-xs text-muted-foreground">
                                {Math.floor(lesson.videoDurationSeconds / 60)}:
                                {(lesson.videoDurationSeconds % 60)
                                  .toString()
                                  .padStart(2, "0")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <Separator className="my-8" />

            {/* Reviews */}
            {reviews && reviews.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Avaliacoes</h2>
                <div className="space-y-4">
                  {reviews.map((item) => (
                    <Card key={item.review.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {item.user.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{item.user.name}</span>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < item.review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            {item.review.title && (
                              <p className="font-medium mt-1">{item.review.title}</p>
                            )}
                            {item.review.content && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.review.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    R$ {(course.priceCents / 100).toFixed(2)}
                  </span>
                  {course.compareAtPriceCents && course.compareAtPriceCents > course.priceCents && (
                    <>
                      <span className="text-lg text-muted-foreground line-through">
                        R$ {(course.compareAtPriceCents / 100).toFixed(2)}
                      </span>
                      <Badge className="bg-red-500">{discount}% OFF</Badge>
                    </>
                  )}
                </div>
              </CardHeader>

              <CardContent>
                {enrollment ? (
                  <Link href={`/curso/${slug}/assistir`}>
                    <Button className="w-full gap-2" size="lg">
                      <Play className="h-5 w-5" />
                      Continuar Curso
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-5 w-5" />
                    )}
                    {course.priceCents === 0 ? "Matricular-se Gratis" : "Comprar Agora"}
                  </Button>
                )}

                <div className="mt-6 space-y-3">
                  <h3 className="font-semibold">Este curso inclui:</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(course.totalDurationMinutes)} de video</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{course.lessonsCount} aulas</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span>Acesso vitalicio</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <span>Certificado de conclusao</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
}
