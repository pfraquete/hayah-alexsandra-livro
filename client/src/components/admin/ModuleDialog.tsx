import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const moduleSchema = z.object({
    title: z.string().min(3, "Título deve ter no mínimo 3 caracteres"),
    description: z.string().optional(),
    orderIndex: z.coerce.number().default(0),
});

type ModuleFormValues = z.infer<typeof moduleSchema>;

interface ModuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    module?: any;
    courseId: number | null;
    onSuccess: () => void;
}

export function ModuleDialog({
    open,
    onOpenChange,
    module,
    courseId,
    onSuccess,
}: ModuleDialogProps) {
    const form = useForm<ModuleFormValues>({
        resolver: zodResolver(moduleSchema) as any,
        defaultValues: {
            title: "",
            description: "",
            orderIndex: 0,
        },
    });

    useEffect(() => {
        if (module) {
            form.reset({
                title: module.title,
                description: module.description || "",
                orderIndex: module.orderIndex,
            });
        } else {
            form.reset({
                title: "",
                description: "",
                orderIndex: 0,
            });
        }
    }, [module, form, open]);

    const createMutation = trpc.marketplace.courses.createModule.useMutation({
        onSuccess: () => {
            toast.success("Módulo criado com sucesso!");
            onSuccess();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || "Erro ao criar módulo");
        },
    });

    const updateMutation = trpc.marketplace.courses.updateModule.useMutation({
        onSuccess: () => {
            toast.success("Módulo atualizado com sucesso!");
            onSuccess();
            onOpenChange(false);
        },
        onError: (error) => {
            toast.error(error.message || "Erro ao atualizar módulo");
        },
    });

    const onSubmit = async (values: ModuleFormValues) => {
        if (!courseId && !module) return;

        if (module) {
            await updateMutation.mutateAsync({
                moduleId: module.id,
                title: values.title,
                description: values.description,
                orderIndex: values.orderIndex,
            });
        } else if (courseId) {
            await createMutation.mutateAsync({
                courseId,
                title: values.title,
                description: values.description,
                orderIndex: values.orderIndex,
            });
        }
    };

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{module ? "Editar Módulo" : "Novo Módulo"}</DialogTitle>
                    <DialogDescription>
                        {module
                            ? "Edite as informações do módulo abaixo."
                            : "Preencha as informações para criar um novo módulo."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Título do Módulo</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex: Introdução" {...field} />
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
                                            placeholder="Descrição do conteúdo do módulo..."
                                            {...field}
                                        />
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

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {module ? "Salvar Alterações" : "Criar Módulo"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
