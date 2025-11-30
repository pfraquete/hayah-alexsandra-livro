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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

const courseSchema = z.object({
    title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
    description: z.string().optional(),
    shortDescription: z.string().max(500, "Máximo de 500 caracteres").optional(),
    price: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
    compareAtPrice: z.coerce.number().optional(),
    thumbnailUrl: z.string().optional(),
    previewVideoUrl: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    isFeatured: z.boolean().default(false),
});

type CourseFormValues = z.infer<typeof courseSchema>;

interface CourseDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    course?: any; // Replace with proper type if available
    onSuccess: () => void;
}

export function CourseDialog({
    open,
    onOpenChange,
    course,
    onSuccess,
}: CourseDialogProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<CourseFormValues>({
        resolver: zodResolver(courseSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            shortDescription: "",
            price: 0,
            compareAtPrice: 0,
            thumbnailUrl: "",
            previewVideoUrl: "",
            status: "draft",
            isFeatured: false,
        },
    });

    useEffect(() => {
        if (course) {
            form.reset({
                title: course.title,
                description: course.description || "",
                shortDescription: course.shortDescription || "",
                price: course.priceCents / 100,
                compareAtPrice: course.compareAtPriceCents ? course.compareAtPriceCents / 100 : 0,
                thumbnailUrl: course.thumbnailUrl || "",
                previewVideoUrl: course.previewVideoUrl || "",
                status: course.status,
                isFeatured: course.isFeatured,
            });
            setPreviewUrl(course.thumbnailUrl || null);
        } else {
            form.reset({
                title: "",
                description: "",
                shortDescription: "",
                price: 0,
                compareAtPrice: 0,
                thumbnailUrl: "",
                previewVideoUrl: "",
                status: "draft",
                isFeatured: false,
            });
            setPreviewUrl(null);
        }
    }, [course, form, open]);

    const createMutation = trpc.marketplace.courses.create.useMutation({
        onSuccess: () => {
            toast.success("Curso criado com sucesso!");
            onSuccess();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || "Erro ao criar curso");
        },
    });

    const updateMutation = trpc.marketplace.courses.update.useMutation({
        onSuccess: () => {
            toast.success("Curso atualizado com sucesso!");
            onSuccess();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || "Erro ao atualizar curso");
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const ext = file.name.split(".").pop();
            const path = `courses/${Date.now()}.${ext}`;
            const { url, error } = await uploadFile(STORAGE_BUCKETS.COURSE_CONTENT, path, file);

            if (error) throw error;

            form.setValue("thumbnailUrl", url);
            setPreviewUrl(url);
            toast.success("Imagem enviada com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar imagem");
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (values: CourseFormValues) => {
        const payload = {
            title: values.title,
            description: values.description,
            shortDescription: values.shortDescription,
            priceCents: Math.round(values.price * 100),
            compareAtPriceCents: values.compareAtPrice ? Math.round(values.compareAtPrice * 100) : undefined,
            thumbnailUrl: values.thumbnailUrl || undefined,
            previewVideoUrl: values.previewVideoUrl || undefined,
            status: values.status,
            isFeatured: values.isFeatured,
        };

        if (course) {
            await updateMutation.mutateAsync({
                courseId: course.id,
                ...payload,
            });
        } else {
            await createMutation.mutateAsync(payload);
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{course ? "Editar Curso" : "Novo Curso"}</DialogTitle>
                    <DialogDescription>
                        {course
                            ? "Edite as informações do curso abaixo."
                            : "Preencha as informações para criar um novo curso."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título do Curso</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Curso de Teologia" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="shortDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição Curta</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Resumo do curso para exibição nos cards" {...field} />
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
                                    <FormLabel>Descrição Completa</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detalhes sobre o conteúdo do curso..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preço (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="compareAtPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Preço Original (R$)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" {...field} />
                                        </FormControl>
                                        <FormDescription>Opcional (para promoções)</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="thumbnailUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Capa do Curso</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById("course-image-upload")?.click()}
                                                    disabled={isUploading}
                                                >
                                                    {isUploading ? (
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Upload className="mr-2 h-4 w-4" />
                                                    )}
                                                    Carregar Imagem
                                                </Button>
                                                <Input
                                                    id="course-image-upload"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={handleImageUpload}
                                                />
                                                {previewUrl && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => {
                                                            setPreviewUrl(null);
                                                            form.setValue("thumbnailUrl", "");
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            {previewUrl && (
                                                <div className="relative w-40 h-24 border rounded-md overflow-hidden">
                                                    <img
                                                        src={previewUrl}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="draft">Rascunho</SelectItem>
                                                <SelectItem value="published">Publicado</SelectItem>
                                                <SelectItem value="archived">Arquivado</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isFeatured"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-8">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Destaque</FormLabel>
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
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {course ? "Salvar Alterações" : "Criar Curso"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
