import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import CommunityLayout from "@/components/CommunityLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Star, Clock, Users, BookOpen, FileText } from "lucide-react";

function CourseCard({
  course,
  creator,
}: {
  course: {
    id: number;
    title: string;
    slug: string;
    shortDescription: string | null;
    thumbnailUrl: string | null;
    priceCents: number;
    compareAtPriceCents: number | null;
    lessonsCount: number;
    studentsCount: number;
    averageRating: string | null;
    totalDurationMinutes: number;
  };
  creator: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
  };
}) {
  const discount = course.compareAtPriceCents
    ? Math.round(((course.compareAtPriceCents - course.priceCents) / course.compareAtPriceCents) * 100)
    : 0;

  return (
    <Link href={`/curso/${course.slug}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col overflow-hidden">
        {/* Thumbnail */}
        <div className="aspect-video bg-muted relative">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          {discount > 0 && (
            <Badge className="absolute top-2 right-2 bg-red-500">
              -{discount}%
            </Badge>
          )}
        </div>

        <CardContent className="pt-4 flex-1">
          <h3 className="font-semibold line-clamp-2 mb-2">{course.title}</h3>
          {course.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {course.shortDescription}
            </p>
          )}

          {/* Creator */}
          <div className="flex items-center gap-2 mb-3">
            <Avatar className="h-6 w-6">
              <AvatarImage src={creator.avatarUrl || undefined} />
              <AvatarFallback className="text-xs">{creator.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{creator.displayName}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {course.averageRating && parseFloat(course.averageRating) > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {parseFloat(course.averageRating).toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {course.studentsCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {course.totalDurationMinutes}min
            </span>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <div>
              {course.compareAtPriceCents && course.compareAtPriceCents > course.priceCents && (
                <span className="text-sm text-muted-foreground line-through mr-2">
                  R$ {(course.compareAtPriceCents / 100).toFixed(2)}
                </span>
              )}
              <span className="font-bold text-lg text-primary">
                R$ {(course.priceCents / 100).toFixed(2)}
              </span>
            </div>
            <Badge variant="secondary">{course.lessonsCount} aulas</Badge>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

function DigitalProductCard({
  product,
  creator,
}: {
  product: {
    id: number;
    title: string;
    slug: string;
    shortDescription: string | null;
    thumbnailUrl: string | null;
    priceCents: number;
    compareAtPriceCents: number | null;
    fileType: string;
    salesCount: number;
  };
  creator: {
    id: number;
    displayName: string;
    avatarUrl: string | null;
  };
}) {
  return (
    <Link href={`/ebook/${product.slug}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col overflow-hidden">
        <div className="aspect-[3/4] bg-muted relative">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
          <Badge className="absolute top-2 right-2 uppercase">
            {product.fileType}
          </Badge>
        </div>

        <CardContent className="pt-4 flex-1">
          <h3 className="font-semibold line-clamp-2 mb-2">{product.title}</h3>
          {product.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {product.shortDescription}
            </p>
          )}

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={creator.avatarUrl || undefined} />
              <AvatarFallback className="text-xs">{creator.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{creator.displayName}</span>
          </div>
        </CardContent>

        <CardFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <span className="font-bold text-lg text-primary">
              R$ {(product.priceCents / 100).toFixed(2)}
            </span>
            <span className="text-sm text-muted-foreground">
              {product.salesCount} vendas
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

function CourseSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="pt-4">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <Skeleton className="h-6 w-20" />
      </CardFooter>
    </Card>
  );
}

export default function Marketplace() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: featuredCourses, isLoading: loadingFeatured } =
    trpc.marketplace.courses.featured.useQuery({ limit: 4 });

  const { data: allCourses, isLoading: loadingCourses } =
    trpc.marketplace.courses.list.useQuery({ limit: 20, offset: 0 });

  const { data: digitalProducts, isLoading: loadingProducts } =
    trpc.marketplace.digitalProducts.list.useQuery({ limit: 20, offset: 0 });

  // Filter courses based on search
  const filteredCourses = allCourses?.filter((item) =>
    item.course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = digitalProducts?.filter((item) =>
    item.product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <CommunityLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Marketplace</h1>
          <p className="text-muted-foreground">
            Descubra cursos e materiais criados por mulheres empreendedoras
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos e produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Featured Courses */}
        {!searchTerm && featuredCourses && featuredCourses.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4">Destaques</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {loadingFeatured
                ? Array.from({ length: 4 }).map((_, i) => <CourseSkeleton key={i} />)
                : featuredCourses.map((item) => (
                    <CourseCard
                      key={item.course.id}
                      course={item.course}
                      creator={item.creator}
                    />
                  ))}
            </div>
          </section>
        )}

        {/* Tabs */}
        <Tabs defaultValue="courses">
          <TabsList>
            <TabsTrigger value="courses">Cursos</TabsTrigger>
            <TabsTrigger value="ebooks">E-books</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="mt-6">
            {loadingCourses ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CourseSkeleton key={i} />
                ))}
              </div>
            ) : filteredCourses && filteredCourses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredCourses.map((item) => (
                  <CourseCard
                    key={item.course.id}
                    course={item.course}
                    creator={item.creator}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">Nenhum curso encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Tente buscar por outros termos"
                    : "Em breve teremos cursos disponiveis"}
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="ebooks" className="mt-6">
            {loadingProducts ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <CourseSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {filteredProducts.map((item) => (
                  <DigitalProductCard
                    key={item.product.id}
                    product={item.product}
                    creator={item.creator}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-semibold mb-2">Nenhum e-book encontrado</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "Tente buscar por outros termos"
                    : "Em breve teremos e-books disponiveis"}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CommunityLayout>
  );
}
