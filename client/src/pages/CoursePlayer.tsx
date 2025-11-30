import { useState, useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Play,
  CheckCircle2,
  Clock,
  FileText,
  Download,
  Lock,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Lesson {
  id: number;
  title: string;
  lessonType: string;
  videoDurationSeconds: number | null;
  isFree: boolean;
  videoUrl: string | null;
  content: string | null;
  downloadUrl: string | null;
}

interface Module {
  id: number;
  title: string;
  lessonsCount: number;
  lessons: Lesson[];
}

export default function CoursePlayer() {
  const { user } = useAuth();
  const [, params] = useRoute("/curso/:slug/assistir");
  const [lessonParams] = useRoute("/curso/:slug/assistir/:lessonId");
  const slug = params?.slug || "";

  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: courseData, isLoading } = trpc.marketplace.courses.getWithContent.useQuery(
    { courseId: 0 }, // We'll need to get courseId from slug first
    { enabled: false }
  );

  // Get course by slug first
  const { data: courseBySlug } = trpc.marketplace.courses.getBySlug.useQuery(
    { slug },
    { enabled: !!slug }
  );

  const { data: fullCourse, isLoading: loadingCourse } = trpc.marketplace.courses.getWithContent.useQuery(
    { courseId: courseBySlug?.course.id || 0 },
    { enabled: !!courseBySlug?.course.id }
  );

  const updateProgressMutation = trpc.marketplace.lessons.updateProgress.useMutation();

  // Select first lesson by default
  useEffect(() => {
    if (fullCourse?.modules && fullCourse.modules.length > 0 && !selectedLessonId) {
      const firstModule = fullCourse.modules[0];
      if (firstModule.lessons.length > 0) {
        setSelectedLessonId(firstModule.lessons[0].id);
      }
    }
  }, [fullCourse, selectedLessonId]);

  const currentLesson = fullCourse?.modules
    .flatMap((m) => m.lessons)
    .find((l) => l.id === selectedLessonId);

  const allLessons = fullCourse?.modules.flatMap((m) => m.lessons) || [];
  const currentIndex = allLessons.findIndex((l) => l.id === selectedLessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const getLessonProgress = (lessonId: number) => {
    return fullCourse?.progress?.find((p) => p.lesson.id === lessonId)?.progress;
  };

  const handleLessonComplete = async () => {
    if (!currentLesson || !fullCourse?.enrollment) return;

    try {
      await updateProgressMutation.mutateAsync({
        lessonId: currentLesson.id,
        isCompleted: true,
      });
      toast.success("Aula concluida!");
    } catch {
      toast.error("Erro ao marcar aula como concluida");
    }
  };

  const handleVideoProgress = async (currentTime: number) => {
    if (!currentLesson || !fullCourse?.enrollment) return;

    // Only update every 30 seconds to avoid too many requests
    await updateProgressMutation.mutateAsync({
      lessonId: currentLesson.id,
      watchedSeconds: Math.floor(currentTime),
    });
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-4">
            Faca login para acessar o conteudo do curso
          </p>
          <Link href="/login">
            <Button>Entrar</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex">
          <div className="flex-1 p-4">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <Skeleton className="h-8 w-3/4 mt-4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
          <div className="w-80 border-l p-4 hidden lg:block">
            <Skeleton className="h-8 w-full mb-4" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!fullCourse) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Curso nao encontrado</h2>
          <p className="text-muted-foreground mb-4">
            Este curso nao existe ou voce nao tem acesso
          </p>
          <Link href="/marketplace">
            <Button>Ver Cursos</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (!fullCourse.enrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground mb-4">
            Voce precisa estar matriculada para acessar este curso
          </p>
          <Link href={`/curso/${slug}`}>
            <Button>Ver Detalhes do Curso</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const LessonItem = ({ lesson, module }: { lesson: Lesson; module: Module }) => {
    const progress = getLessonProgress(lesson.id);
    const isCompleted = progress?.isCompleted;
    const isSelected = selectedLessonId === lesson.id;
    const isLocked = !lesson.isFree && !fullCourse.enrollment;

    return (
      <button
        onClick={() => !isLocked && setSelectedLessonId(lesson.id)}
        disabled={isLocked}
        className={cn(
          "w-full text-left p-3 rounded-lg transition-colors flex items-start gap-3",
          isSelected ? "bg-primary/10" : "hover:bg-muted",
          isLocked && "opacity-50 cursor-not-allowed"
        )}
      >
        <div className="shrink-0 mt-0.5">
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : isLocked ? (
            <Lock className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Play className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium line-clamp-2", isSelected && "text-primary")}>
            {lesson.title}
          </p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {lesson.lessonType === "video" && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(lesson.videoDurationSeconds)}
              </span>
            )}
            {lesson.lessonType === "text" && (
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Texto
              </span>
            )}
            {lesson.lessonType === "download" && (
              <span className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                Download
              </span>
            )}
            {lesson.isFree && <Badge variant="secondary" className="text-xs">Gratis</Badge>}
          </div>
        </div>
      </button>
    );
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Course Info */}
      <div className="p-4 border-b">
        <Link href={`/curso/${slug}`}>
          <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
        <h2 className="font-semibold line-clamp-2">{fullCourse.title}</h2>
        <div className="mt-2">
          <Progress value={fullCourse.enrollment?.progressPercent || 0} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {fullCourse.enrollment?.progressPercent || 0}% completo
          </p>
        </div>
      </div>

      {/* Modules & Lessons */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {fullCourse.modules.map((module, moduleIndex) => (
            <Collapsible key={module.id} defaultOpen={moduleIndex === 0}>
              <CollapsibleTrigger className="w-full p-3 flex items-center justify-between hover:bg-muted rounded-lg">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">
                    Modulo {moduleIndex + 1}
                  </p>
                  <p className="font-medium text-sm line-clamp-1">{module.title}</p>
                </div>
                <ChevronDown className="h-4 w-4 shrink-0" />
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-2">
                {module.lessons.map((lesson) => (
                  <LessonItem key={lesson.id} lesson={lesson} module={module} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b h-14 flex items-center px-4">
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="ml-3 font-semibold truncate">{currentLesson?.title || fullCourse.title}</h1>
      </header>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Conteudo do Curso</h2>
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="h-[calc(100vh-57px)]">
            <Sidebar />
          </div>
        </div>
      )}

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1 lg:mr-80 pt-14 lg:pt-0">
          {currentLesson ? (
            <div>
              {/* Video Player */}
              {currentLesson.lessonType === "video" && currentLesson.videoUrl && (
                <div className="bg-black aspect-video">
                  <video
                    ref={videoRef}
                    src={currentLesson.videoUrl}
                    className="w-full h-full"
                    controls
                    onEnded={handleLessonComplete}
                    onTimeUpdate={(e) => {
                      const video = e.target as HTMLVideoElement;
                      // Update progress every 30 seconds
                      if (Math.floor(video.currentTime) % 30 === 0) {
                        handleVideoProgress(video.currentTime);
                      }
                    }}
                  />
                </div>
              )}

              {/* Lesson Content */}
              <div className="p-4 md:p-6">
                <h1 className="text-2xl font-bold">{currentLesson.title}</h1>

                {/* Text Content */}
                {currentLesson.lessonType === "text" && currentLesson.content && (
                  <div className="mt-4 prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: currentLesson.content }} />
                  </div>
                )}

                {/* Download Content */}
                {currentLesson.lessonType === "download" && currentLesson.downloadUrl && (
                  <div className="mt-4">
                    <a href={currentLesson.downloadUrl} download>
                      <Button className="gap-2">
                        <Download className="h-4 w-4" />
                        Baixar Material
                      </Button>
                    </a>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t">
                  <Button
                    variant="outline"
                    disabled={!prevLesson}
                    onClick={() => prevLesson && setSelectedLessonId(prevLesson.id)}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>

                  <Button
                    onClick={handleLessonComplete}
                    variant="secondary"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como Concluida
                  </Button>

                  <Button
                    disabled={!nextLesson}
                    onClick={() => nextLesson && setSelectedLessonId(nextLesson.id)}
                  >
                    Proxima
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[50vh]">
              <p className="text-muted-foreground">Selecione uma aula</p>
            </div>
          )}
        </main>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-80 border-l fixed right-0 top-0 bottom-0 flex-col bg-background">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}
