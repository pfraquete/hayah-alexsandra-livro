import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, ArrowLeft, GripVertical, Pencil, Trash2, Video, FileText } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ModuleDialog } from "@/components/admin/ModuleDialog";
import { LessonDialog } from "@/components/admin/LessonDialog";

export default function CourseManager() {
    const [match, params] = useRoute("/admin/courses/:courseId");
    const [location, setLocation] = useLocation();
    const courseId = params?.courseId ? parseInt(params.courseId) : null;

    const [moduleModal, setModuleModal] = useState<{ open: boolean; module?: any }>({ open: false, module: undefined });
    const [lessonModal, setLessonModal] = useState<{ open: boolean; lesson?: any; moduleId?: number }>({ open: false, lesson: undefined, moduleId: undefined });

    const { data: course, isLoading: loadingCourse } = trpc.marketplace.courses.get.useQuery(
        { id: courseId! },
        { enabled: !!courseId }
    );

    const { data: modules, isLoading: loadingModules, refetch: refetchModules } = trpc.marketplace.courses.getModules.useQuery(
        { courseId: courseId! },
        { enabled: !!courseId }
    );

    const deleteModuleMutation = trpc.marketplace.courses.deleteModule.useMutation({
        onSuccess: () => {
            toast.success("Módulo excluído com sucesso");
            refetchModules();
        },
        onError: (error) => toast.error(error.message),
    });

    const deleteLessonMutation = trpc.marketplace.courses.deleteLesson.useMutation({
        onSuccess: () => {
            toast.success("Aula excluída com sucesso");
            refetchModules();
        },
        onError: (error) => toast.error(error.message),
    });

    if (!courseId) return <div>Curso não encontrado</div>;

    if (loadingCourse) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!course) return <div>Curso não encontrado</div>;

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setLocation("/admin")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">{course.title}</h1>
                    <p className="text-muted-foreground">Gerenciamento de Conteúdo</p>
                </div>
                <div className="ml-auto flex gap-2">
                    <Button onClick={() => setModuleModal({ open: true, module: undefined })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Módulo
                    </Button>
                </div>
            </div>

            <div className="grid gap-6">
                {loadingModules ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : modules && modules.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full space-y-4">
                        {modules.map((module) => (
                            <AccordionItem key={module.id} value={`module-${module.id}`} className="border rounded-lg px-4 bg-white/50 backdrop-blur-sm">
                                <div className="flex items-center justify-between py-4">
                                    <AccordionTrigger className="hover:no-underline py-0 flex-1">
                                        <div className="flex items-center gap-4 text-left">
                                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                                            <div>
                                                <div className="font-semibold text-lg">{module.title}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {module.lessons?.length || 0} aulas
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModuleModal({ open: true, module });
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="text-destructive hover:text-destructive"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm("Tem certeza que deseja excluir este módulo?")) {
                                                    deleteModuleMutation.mutate({ moduleId: module.id });
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <AccordionContent className="pt-4 pb-6 space-y-4">
                                    <div className="pl-8 space-y-2">
                                        {module.lessons && module.lessons.length > 0 ? (
                                            module.lessons.map((lesson: any) => (
                                                <div key={lesson.id} className="flex items-center justify-between p-3 rounded-md bg-white border">
                                                    <div className="flex items-center gap-3">
                                                        {lesson.videoUrl ? (
                                                            <Video className="h-4 w-4 text-blue-500" />
                                                        ) : (
                                                            <FileText className="h-4 w-4 text-orange-500" />
                                                        )}
                                                        <span className="font-medium">{lesson.title}</span>
                                                        <Badge variant={lesson.isFree ? "secondary" : "outline"}>
                                                            {lesson.isFree ? "Gratuito" : "Pago"}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => setLessonModal({ open: true, lesson, moduleId: module.id })}
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => {
                                                                if (confirm("Tem certeza que deseja excluir esta aula?")) {
                                                                    deleteLessonMutation.mutate({ lessonId: lesson.id });
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-muted-foreground text-sm">
                                                Nenhuma aula neste módulo
                                            </div>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full mt-2"
                                            onClick={() => setLessonModal({ open: true, lesson: undefined, moduleId: module.id })}
                                        >
                                            <Plus className="mr-2 h-4 w-4" />
                                            Adicionar Aula
                                        </Button>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <Card className="glass-card">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Plus className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Comece a criar seu curso</h3>
                            <p className="text-muted-foreground mb-4 text-center max-w-sm">
                                Crie módulos para organizar o conteúdo do seu curso. Dentro de cada módulo, você poderá adicionar aulas.
                            </p>
                            <Button onClick={() => setModuleModal({ open: true, module: undefined })}>
                                Criar Primeiro Módulo
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            <ModuleDialog
                open={moduleModal.open}
                onOpenChange={(open) => setModuleModal(prev => ({ ...prev, open }))}
                module={moduleModal.module}
                courseId={courseId}
                onSuccess={() => refetchModules()}
            />

            <LessonDialog
                open={lessonModal.open}
                onOpenChange={(open) => setLessonModal(prev => ({ ...prev, open }))}
                lesson={lessonModal.lesson}
                moduleId={lessonModal.moduleId}
                onSuccess={() => refetchModules()}
            />
        </div>
    );
}
