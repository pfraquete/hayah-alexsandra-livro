import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Package,
  Download,
  Search,
  ShoppingCart,
  Truck,
  FileText,
} from "lucide-react";

export default function Loja() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: products, isLoading } = trpc.products.list.useQuery();

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const physicalProducts = filteredProducts?.filter((p) => p.productType === "physical") || [];
  const digitalProducts = filteredProducts?.filter((p) => p.productType === "digital") || [];

  return (
    <div className="min-h-screen relative overflow-hidden py-8">
      <div className="absolute inset-0 mesh-gradient opacity-20 -z-10" />
      
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Loja</h1>
          <p className="text-muted-foreground">
            Explore nossos livros físicos e produtos digitais
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Products */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">
              Todos ({filteredProducts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="physical">
              <Package className="h-4 w-4 mr-2" />
              Livros Físicos ({physicalProducts.length})
            </TabsTrigger>
            <TabsTrigger value="digital">
              <Download className="h-4 w-4 mr-2" />
              Produtos Digitais ({digitalProducts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ProductGrid
              products={filteredProducts || []}
              isLoading={isLoading}
              onProductClick={(slug) => setLocation(`/produto/${slug}`)}
            />
          </TabsContent>

          <TabsContent value="physical" className="mt-6">
            <ProductGrid
              products={physicalProducts}
              isLoading={isLoading}
              onProductClick={(slug) => setLocation(`/produto/${slug}`)}
            />
          </TabsContent>

          <TabsContent value="digital" className="mt-6">
            <ProductGrid
              products={digitalProducts}
              isLoading={isLoading}
              onProductClick={(slug) => setLocation(`/produto/${slug}`)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProductGrid({
  products,
  isLoading,
  onProductClick,
}: {
  products: any[];
  isLoading: boolean;
  onProductClick: (slug: string) => void;
}) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Card className="p-12 text-center">
        <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold mb-2">Nenhum produto encontrado</h3>
        <p className="text-muted-foreground">
          Tente ajustar sua busca ou filtros
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Card
          key={product.id}
          className="group cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => onProductClick(product.slug)}
        >
          <CardHeader className="p-0">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-64 object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center rounded-t-lg">
                {product.productType === "physical" ? (
                  <Package className="h-16 w-16 text-pink-300" />
                ) : (
                  <FileText className="h-16 w-16 text-purple-300" />
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                {product.name}
              </h3>
              <Badge variant="outline" className="ml-2">
                {product.productType === "physical" ? (
                  <><Truck className="h-3 w-3 mr-1" /> Físico</>
                ) : (
                  <><Download className="h-3 w-3 mr-1" /> Digital</>
                )}
              </Badge>
            </div>

            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {product.description}
              </p>
            )}

            <div className="flex items-baseline gap-2">
              {product.compareAtPriceCents && product.compareAtPriceCents > product.priceCents && (
                <span className="text-sm text-muted-foreground line-through">
                  R$ {(product.compareAtPriceCents / 100).toFixed(2)}
                </span>
              )}
              <span className="text-2xl font-bold text-[var(--rosa-principal)]">
                R$ {(product.priceCents / 100).toFixed(2)}
              </span>
            </div>

            {product.productType === "physical" && product.stockQuantity !== null && (
              <div className="mt-2">
                {product.stockQuantity > 0 ? (
                  <Badge variant="outline" className="text-green-600">
                    {product.stockQuantity} em estoque
                  </Badge>
                ) : (
                  <Badge variant="destructive">Esgotado</Badge>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="p-4 pt-0">
            <Button className="w-full" disabled={product.productType === "physical" && (product.stockQuantity ?? 0) === 0}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.productType === "physical" ? "Comprar" : "Adquirir"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
