import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { uploadFile, STORAGE_BUCKETS } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X, Video } from "lucide-react";
import { toast } from "sonner";

const lessonSchema = z.object({
    title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
    description: z.string().optional(),
    videoUrl: z.string().optional(),
    duration: z.coerce.number().optional(),
    isFree: z.boolean().default(false),
    orderIndex: z.coerce.number().default(0),
});

type LessonFormValues = z.infer<typeof lessonSchema>;

interface LessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lesson?: any;
    moduleId?: number;
    onSuccess: () => void;
}

export function LessonDialog({
    open,
    onOpenChange,
    lesson,
    moduleId,
    onSuccess,
}: LessonDialogProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);

    const form = useForm<LessonFormValues>({
        resolver: zodResolver(lessonSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            videoUrl: "",
            duration: 0,
            isFree: false,
            orderIndex: 0,
        },
    });

    useEffect(() => {
        if (lesson) {
            form.reset({
                title: lesson.title,
                description: lesson.description || "",
                videoUrl: lesson.videoUrl || "",
                duration: lesson.duration || 0,
                isFree: lesson.isFree,
                orderIndex: lesson.orderIndex,
            });
            setVideoPreview(lesson.videoUrl || null);
        } else {
            form.reset({
                title: "",
                description: "",
                videoUrl: "",
                duration: 0,
                isFree: false,
                orderIndex: 0,
            });
            setVideoPreview(null);
        }
    }, [lesson, form, open]);

    const createMutation = trpc.marketplace.courses.createLesson.useMutation({
        onSuccess: () => {
            toast.success("Aula criada com sucesso!");
            onSuccess();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || "Erro ao criar aula");
        },
    });

    const updateMutation = trpc.marketplace.courses.updateLesson.useMutation({
        onSuccess: () => {
            toast.success("Aula atualizada com sucesso!");
            onSuccess();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || "Erro ao atualizar aula");
        },
    });

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const ext = file.name.split(".").pop();
            const path = `lessons/${Date.now()}.${ext}`;
            const { url, error } = await uploadFile(STORAGE_BUCKETS.COURSE_CONTENT, path, file);

            if (error) throw error;

            form.setValue("videoUrl", url);
            setVideoPreview(url);
            toast.success("Vídeo enviado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar vídeo");
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (values: LessonFormValues) => {
        if (!moduleId && !lesson) return;

        const payload = {
            title: values.title,
            description: values.description,
            videoUrl: values.videoUrl || undefined,
            duration: values.duration,
            isFree: values.isFree,
            orderIndex: values.orderIndex,
        };

        if (lesson) {
            await updateMutation.mutateAsync({
                lessonId: lesson.id,
                ...payload,
            });
        } else if (moduleId) {
            await createMutation.mutateAsync({
                moduleId,
                ...payload,
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{lesson ? "Editar Aula" : "Nova Aula"}</DialogTitle>
                    <DialogDescription>
                        {lesson
                            ? "Edite as informações da aula abaixo."
                            : "Preencha as informações para criar uma nova aula."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título da Aula</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Aula 1 - Conceitos Básicos" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Resumo do conteúdo da aula..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="videoUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vídeo da Aula</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById("lesson-video-upload")?.click()}
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="mr-2 h-4 w-4" />
                                                    )}
                                                    Carregar Vídeo
                                                </Button>
                                                <Input
                                                    id="lesson-video-upload"
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={handleVideoUpload}
                                                />
                                                {videoPreview && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setVideoPreview(null);
                                                            form.setValue("videoUrl", "");
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            {videoPreview && (
                                                <div className="relative w-full aspect-video border rounded-md overflow-hidden bg-black">
                                                    <video
                                                        src={videoPreview}
                                                        controls
                                                        className="w-full h-full"
                                                    />
                                                </div>
                                            )}
                                            <div className="text-xs text-muted-foreground">
                                                Ou insira uma URL externa (YouTube, Vimeo, etc)
                                            </div>
                                            <Input placeholder="https://..." {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Duração (segundos)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="orderIndex"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ordem</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="isFree"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Aula Gratuita</FormLabel>
                                        <FormDescription>
                                            Permitir que usuários assistam sem comprar o curso (preview)
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {lesson ? "Salvar Alterações" : "Criar Aula"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
