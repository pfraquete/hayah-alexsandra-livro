import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import CommunityLayout from "@/components/CommunityLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  ShoppingBag,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

function EnrollmentCard({
  enrollment,
  course,
  creator,
}: {
  enrollment: {
    id: number;
    progressPercent: number;
    completedLessonsCount: number;
    lastAccessedAt: Date | null;
    completedAt: Date | null;
  };
  course: {
    id: number;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    lessonsCount: number;
    totalDurationMinutes: number;
  };
  creator: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
  } | null;
}) {
  const isCompleted = enrollment.completedAt !== null;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Thumbnail */}
        <div className="md:w-48 aspect-video md:aspect-auto bg-muted relative shrink-0">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
          {isCompleted && (
            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-semibold line-clamp-1">{course.title}</h3>
              {creator && (
                <div className="flex items-center gap-2 mt-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={creator.avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {creator.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{creator.displayName}</span>
                </div>
              )}
            </div>

            {isCompleted ? (
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Concluido
              </Badge>
            ) : (
              <Badge variant="secondary">
                {enrollment.progressPercent}% completo
              </Badge>
            )}
          </div>

          {/* Progress */}
          <div className="mt-4">
            <Progress value={enrollment.progressPercent} className="h-2" />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>
                {enrollment.completedLessonsCount} de {course.lessonsCount} aulas
              </span>
              {enrollment.lastAccessedAt && (
                <span>
                  Ultimo acesso:{" "}
                  {formatDistanceToNow(new Date(enrollment.lastAccessedAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4">
            <Link href={`/curso/${course.slug}/assistir`}>
              <Button size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                {isCompleted ? "Rever" : "Continuar"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}

function PurchaseCard({
  purchase,
  product,
  creator,
}: {
  purchase: {
    id: number;
    downloadCount: number;
    createdAt: Date;
  };
  product: {
    id: number;
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    fileType: string;
    fileUrl: string;
  };
  creator: {
    id: number;
    displayName: string;
  } | null;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="flex">
        {/* Thumbnail */}
        <div className="w-24 md:w-32 aspect-[3/4] bg-muted relative shrink-0">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <h3 className="font-semibold line-clamp-1">{product.title}</h3>
          {creator && <p className="text-sm text-muted-foreground mt-1">{creator.displayName}</p>}

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="uppercase text-xs">
              {product.fileType}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {purchase.downloadCount} downloads
            </span>
          </div>

          <div className="mt-4">
            <a href={product.fileUrl} download>
              <Button size="sm" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Baixar
              </Button>
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}

function EnrollmentSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <Skeleton className="md:w-48 aspect-video md:aspect-square" />
        <div className="flex-1 p-4">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <Skeleton className="h-2 w-full mb-2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      </div>
    </Card>
  );
}

export default function MyCourses() {
  const { user } = useAuth();

  const { data: enrollments, isLoading: loadingEnrollments } =
    trpc.marketplace.enrollments.myEnrollments.useQuery(undefined, {
      enabled: !!user,
    });

  const { data: purchases, isLoading: loadingPurchases } =
    trpc.marketplace.digitalProducts.myPurchases.useQuery(undefined, {
      enabled: !!user,
    });

  if (!user) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto p-4">
          <Card className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Faca login para ver seus cursos</h2>
            <p className="text-muted-foreground mb-4">
              Acesse sua conta para ver os cursos que voce esta matriculada
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/login">
                <Button>Entrar</Button>
              </Link>
              <Link href="/marketplace">
                <Button variant="outline">Ver Cursos</Button>
              </Link>
            </div>
          </Card>
        </div>
      </CommunityLayout>
    );
  }

  const inProgressEnrollments = enrollments?.filter(
    (e) => e.enrollment.progressPercent > 0 && !e.enrollment.completedAt
  );
  const completedEnrollments = enrollments?.filter((e) => e.enrollment.completedAt);
  const notStartedEnrollments = enrollments?.filter((e) => e.enrollment.progressPercent === 0);

  return (
    <CommunityLayout>
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meus Cursos</h1>
          <p className="text-muted-foreground">
            Acompanhe seu progresso e continue aprendendo
          </p>
        </div>

        <Tabs defaultValue="courses">
          <TabsList>
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Cursos
              {enrollments && enrollments.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {enrollments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="ebooks" className="gap-2">
              <FileText className="h-4 w-4" />
              E-books
              {purchases && purchases.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {purchases.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            {loadingEnrollments ? (
              <div className="space-y-4">
                <EnrollmentSkeleton />
                <EnrollmentSkeleton />
              </div>
            ) : enrollments && enrollments.length > 0 ? (
              <div className="space-y-8">
                {/* In Progress */}
                {inProgressEnrollments && inProgressEnrollments.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      Em andamento
                    </h2>
                    <div className="space-y-4">
                      {inProgressEnrollments.map((item) => (
                        <EnrollmentCard
                          key={item.enrollment.id}
                          enrollment={item.enrollment}
                          course={item.course}
                          creator={item.creator}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Not Started */}
                {notStartedEnrollments && notStartedEnrollments.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Play className="h-5 w-5 text-muted-foreground" />
                      Nao iniciados
                    </h2>
                    <div className="space-y-4">
                      {notStartedEnrollments.map((item) => (
                        <EnrollmentCard
                          key={item.enrollment.id}
                          enrollment={item.enrollment}
                          course={item.course}
                          creator={item.creator}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Completed */}
                {completedEnrollments && completedEnrollments.length > 0 && (
                  <section>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Concluidos
                    </h2>
                    <div className="space-y-4">
                      {completedEnrollments.map((item) => (
                        <EnrollmentCard
                          key={item.enrollment.id}
                          enrollment={item.enrollment}
                          course={item.course}
                          creator={item.creator}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">Voce ainda nao tem cursos</h3>
                <p className="text-muted-foreground mb-4">
                  Explore o marketplace e encontre cursos incriveis
                </p>
                <Link href="/marketplace">
                  <Button className="gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Ver Marketplace
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ebooks" className="mt-6">
            {loadingPurchases ? (
              <div className="space-y-4">
                <EnrollmentSkeleton />
              </div>
            ) : purchases && purchases.length > 0 ? (
              <div className="space-y-4">
                {purchases.map((item) => (
                  <PurchaseCard
                    key={item.purchase.id}
                    purchase={item.purchase}
                    product={item.product}
                    creator={item.creator}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">Voce ainda nao tem e-books</h3>
                <p className="text-muted-foreground mb-4">
                  Explore o marketplace e encontre materiais incriveis
                </p>
                <Link href="/marketplace">
                  <Button className="gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Ver Marketplace
                  </Button>
                </Link>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CommunityLayout>
  );
}
