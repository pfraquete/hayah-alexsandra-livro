import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  FileText,
  Calendar,
  Package,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function MeusProdutosDigitais() {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const { data: purchases, isLoading, refetch } = trpc.marketplace.digitalProducts.myPurchases.useQuery();

  const downloadMutation = trpc.marketplace.digitalProducts.download.useMutation({
    onSuccess: (data: any) => {
      if (data.downloadUrl) {
        // Abrir em nova aba
        window.open(data.downloadUrl, '_blank');
        toast.success('Download iniciado!');
        refetch(); // Atualizar contagem de downloads
      }
      setDownloadingId(null);
    },
    onError: (error: any) => {
      toast.error(`Erro ao baixar: ${error.message}`);
      setDownloadingId(null);
    },
  });

  const handleDownload = (purchaseId: number) => {
    setDownloadingId(purchaseId);
    downloadMutation.mutate({ purchaseId });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Meus Produtos Digitais</h1>
          <p className="text-muted-foreground">
            Acesse e baixe seus produtos digitais comprados
          </p>
        </div>

        {/* Stats */}
        {purchases && purchases.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{purchases.length}</div>
                <p className="text-xs text-muted-foreground">
                  Produtos digitais comprados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Downloads</CardTitle>
                <Download className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {purchases.reduce((sum: number, p: any) => sum + (p.purchase.downloadCount || 0), 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Downloads realizados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Investido</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R${" "}
                  {(
                    purchases.reduce((sum: number, p: any) => sum + p.purchase.pricePaidCents, 0) / 100
                  ).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total gasto em produtos digitais
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products List */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : purchases && purchases.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {purchases.map((item: any) => (
              <Card key={item.purchase.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2">{item.product.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {item.product.fileType && (
                          <Badge variant="outline" className="text-xs">
                            {item.product.fileType.toUpperCase()}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Comprado em{" "}
                        {new Date(item.purchase.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Download className="h-4 w-4" />
                      <span>
                        {item.purchase.downloadCount || 0}{" "}
                        {item.purchase.downloadCount === 1 ? "download" : "downloads"}
                      </span>
                    </div>
                    {item.purchase.lastDownloadedAt && (
                      <div className="text-xs text-muted-foreground">
                        Último download:{" "}
                        {new Date(item.purchase.lastDownloadedAt).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleDownload(item.purchase.id)}
                    disabled={downloadingId === item.purchase.id}
                  >
                    {downloadingId === item.purchase.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Baixando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold mb-2">Nenhum produto digital</h3>
            <p className="text-muted-foreground mb-4">
              Você ainda não comprou nenhum produto digital.
            </p>
            <Button onClick={() => (window.location.href = "/loja")}>
              Ir para a Loja
            </Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
