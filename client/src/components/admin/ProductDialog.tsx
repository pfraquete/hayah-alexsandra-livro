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
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

const productSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    slug: z.string().min(1, "Slug é obrigatório"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
    compareAtPrice: z.coerce.number().optional(),
    stockQuantity: z.coerce.number().min(0, "Estoque deve ser maior ou igual a 0"),
    active: z.boolean().default(true),
    imageUrl: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product?: any; // Replace with proper type if available
    onSuccess: () => void;
}

export function ProductDialog({
    open,
    onOpenChange,
    product,
    onSuccess,
}: ProductDialogProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            price: 0,
            compareAtPrice: 0,
            stockQuantity: 0,
            active: true,
            imageUrl: "",
        },
    });

    useEffect(() => {
        if (product) {
            form.reset({
                name: product.name,
                slug: product.slug,
                description: product.description || "",
                price: product.priceCents / 100,
                compareAtPrice: product.compareAtPriceCents ? product.compareAtPriceCents / 100 : 0,
                stockQuantity: product.stockQuantity,
                active: product.active,
                imageUrl: product.imageUrl || "",
            });
            setPreviewUrl(product.imageUrl || null);
        } else {
            form.reset({
                name: "",
                slug: "",
                description: "",
                price: 0,
                compareAtPrice: 0,
                stockQuantity: 0,
                active: true,
                imageUrl: "",
            });
            setPreviewUrl(null);
        }
    }, [product, form, open]);

    // Auto-generate slug from name if creating new product
    const watchName = form.watch("name");
    useEffect(() => {
        if (!product && watchName) {
            const slug = watchName
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .substring(0, 200);
            form.setValue("slug", slug);
        }
    }, [watchName, product, form]);

    const createMutation = trpc.admin.products.create.useMutation({
        onSuccess: () => {
            toast.success("Produto criado com sucesso!");
            onSuccess();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || "Erro ao criar produto");
        },
    });

    const updateMutation = trpc.admin.products.update.useMutation({
        onSuccess: () => {
            toast.success("Produto atualizado com sucesso!");
            onSuccess();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || "Erro ao atualizar produto");
        },
    });

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const ext = file.name.split(".").pop();
            const path = `products/${Date.now()}.${ext}`;
            const { url, error } = await uploadFile(STORAGE_BUCKETS.POST_MEDIA, path, file);

            if (error) throw error;

            form.setValue("imageUrl", url);
            setPreviewUrl(url);
            toast.success("Imagem enviada com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar imagem");
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (values: ProductFormValues) => {
        const payload = {
            name: values.name,
            slug: values.slug,
            description: values.description,
            priceCents: Math.round(values.price * 100),
            compareAtPriceCents: values.compareAtPrice ? Math.round(values.compareAtPrice * 100) : undefined,
            stockQuantity: values.stockQuantity,
            imageUrl: values.imageUrl || undefined,
            active: values.active,
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
                    <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                    <DialogDescription>
                        {product
                            ? "Edite as informações do produto abaixo."
                            : "Preencha as informações para criar um novo produto."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nome do Produto</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ex: Livro Mulher Sábia" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug (URL)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ex: livro-mulher-sabia" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descrição detalhada do produto..."
                                            className="min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                            <FormField
                                control={form.control}
                                name="stockQuantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Estoque</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Imagem do Produto</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => document.getElementById("product-image-upload")?.click()}
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
                                                    id="product-image-upload"
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
                                                            form.setValue("imageUrl", "");
                                                        }}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            {previewUrl && (
                                                <div className="relative w-40 h-40 border rounded-md overflow-hidden">
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
                            name="active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Ativo</FormLabel>
                                        <FormDescription>
                                            Disponível para venda na loja
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
                                {product ? "Salvar Alterações" : "Criar Produto"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
