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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, X, FileText } from "lucide-react";
import { toast } from "sonner";

const digitalProductSchema = z.object({
    title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
    description: z.string().optional(),
    shortDescription: z.string().max(500, "Máximo de 500 caracteres").optional(),
    price: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
    compareAtPrice: z.coerce.number().optional(),
    thumbnailUrl: z.string().optional(),
    fileUrl: z.string().min(1, "Arquivo é obrigatório"),
    fileType: z.string().default("application/pdf"),
    status: z.enum(["draft", "published", "archived"]).default("draft"),
});

type DigitalProductFormValues = z.infer<typeof digitalProductSchema>;

interface DigitalProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: any;
    onSuccess: () => void;
}

export function DigitalProductDialog({
    open,
    onOpenChange,
    product,
    onSuccess,
}: DigitalProductDialogProps) {
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isUploadingFile, setIsUploadingFile] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<DigitalProductFormValues>({
        resolver: zodResolver(digitalProductSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            shortDescription: "",
            price: 0,
            compareAtPrice: 0,
            thumbnailUrl: "",
            fileUrl: "",
            fileType: "application/pdf",
            status: "draft",
        },
    });

    useEffect(() => {
        if (product) {
            form.reset({
                title: product.title,
                description: product.description || "",
                shortDescription: product.shortDescription || "",
                price: product.priceCents / 100,
                compareAtPrice: product.compareAtPriceCents ? product.compareAtPriceCents / 100 : 0,
                thumbnailUrl: product.thumbnailUrl || "",
                fileUrl: product.fileUrl || "",
                fileType: product.fileType || "application/pdf",
                status: product.status,
            });
            setPreviewUrl(product.thumbnailUrl || null);
        } else {
            form.reset({
                title: "",
                description: "",
                shortDescription: "",
                price: 0,
                compareAtPrice: 0,
                thumbnailUrl: "",
                fileUrl: "",
                fileType: "application/pdf",
                status: "draft",
            });
            setPreviewUrl(null);
        }
    }, [product, form, open]);

    const createMutation = trpc.marketplace.digitalProducts.create.useMutation({
        onSuccess: () => {
            toast.success("Produto digital criado com sucesso!");
            onSuccess();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || "Erro ao criar produto digital");
        },
    });

    const updateMutation = trpc.marketplace.digitalProducts.update.useMutation({
        onSuccess: () => {
            toast.success("Produto digital atualizado com sucesso!");
            onSuccess();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || "Erro ao atualizar produto digital");
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingImage(true);
        try {
            const ext = file.name.split(".").pop();
            const path = `digital-covers/${Date.now()}.${ext}`;
            const { url, error } = await uploadFile(STORAGE_BUCKETS.DIGITAL_PRODUCTS, path, file);

            if (error) throw error;

            form.setValue("thumbnailUrl", url);
            setPreviewUrl(url);
            toast.success("Capa enviada com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar capa");
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingFile(true);
        try {
            const ext = file.name.split(".").pop();
            const path = `files/${Date.now()}.${ext}`;
            const { url, error } = await uploadFile(STORAGE_BUCKETS.DIGITAL_PRODUCTS, path, file);

            if (error) throw error;

            form.setValue("fileUrl", url);
            form.setValue("fileType", file.type);
            toast.success("Arquivo enviado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar arquivo");
        } finally {
            setIsUploadingFile(false);
        }
    };

    const onSubmit = async (values: DigitalProductFormValues) => {
        const payload = {
            title: values.title,
            description: values.description,
            shortDescription: values.shortDescription,
            priceCents: Math.round(values.price * 100),
            compareAtPriceCents: values.compareAtPrice ? Math.round(values.compareAtPrice * 100) : undefined,
            thumbnailUrl: values.thumbnailUrl || undefined,
            fileUrl: values.fileUrl,
            fileType: values.fileType,
            status: values.status,
        };

        if (product) {
            await updateMutation.mutateAsync({
                productId: product.id,
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
                    <DialogTitle>{product ? "Editar Produto Digital" : "Novo Produto Digital"}</DialogTitle>
                    <DialogDescription>
                        {product
                            ? "Edite as informações do produto digital abaixo."
                            : "Preencha as informações para criar um novo produto digital (eBook, arquivo, etc)."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: eBook - Guia Completo" {...field} />
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
                                        <Input placeholder="Resumo para exibição nos cards" {...field} />
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
                                            placeholder="Detalhes sobre o produto..."
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="thumbnailUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capa do Produto</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => document.getElementById("digital-image-upload")?.click()}
                                                        disabled={isUploadingImage}
                                                    >
                                                        {isUploadingImage ? (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Upload className="mr-2 h-4 w-4" />
                                                        )}
                                                        Carregar Capa
                                                    </Button>
                                                    <Input
                                                        id="digital-image-upload"
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
                                                    <div className="relative w-32 h-40 border rounded-md overflow-hidden">
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

                            <FormField
                                control={form.control}
                                name="fileUrl"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Arquivo Digital</FormLabel>
                                        <FormControl>
                                            <div className="flex flex-col gap-4">
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => document.getElementById("digital-file-upload")?.click()}
                                                        disabled={isUploadingFile}
                                                    >
                                                        {isUploadingFile ? (
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Upload className="mr-2 h-4 w-4" />
                                                        )}
                                                        Carregar Arquivo
                                                    </Button>
                                                    <Input
                                                        id="digital-file-upload"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={handleFileUpload}
                                                    />
                                                </div>
                                                {field.value && (
                                                    <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
                                                        <FileText className="h-4 w-4" />
                                                        <span className="truncate max-w-[200px]">Arquivo carregado</span>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => {
                                                                form.setValue("fileUrl", "");
                                                                form.setValue("fileType", "application/pdf");
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {product ? "Salvar Alterações" : "Criar Produto"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
