import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Users,
  ShoppingBag,
  BookOpen,
  Bell,
  Settings,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface CommunityLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { href: "/comunidade", label: "Feed", icon: Home },
  { href: "/comunidade/explorar", label: "Explorar", icon: Users },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/meus-cursos", label: "Meus Cursos", icon: BookOpen },
];

const creatorNavItems = [
  { href: "/criadora/novo-post", label: "Novo Post", icon: PlusCircle },
  { href: "/criadora/cursos", label: "Meus Produtos", icon: BookOpen },
];

function Sidebar({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: creatorProfile } = trpc.social.creator.myProfile.useQuery(undefined, {
    enabled: !!user,
  });
  const { data: unreadCount } = trpc.social.notifications.unreadCount.useQuery(undefined, {
    enabled: !!user,
  });

  const handleNavigation = () => {
    if (onNavigate) onNavigate();
  };

  return (
    <aside className={cn("flex flex-col h-full bg-card border-r", className)}>
      {/* Logo */}
      <div className="p-4 border-b">
        <Link href="/" onClick={handleNavigation}>
          <h1 className="text-xl font-bold text-primary">Hayah</h1>
          <p className="text-xs text-muted-foreground">Comunidade</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href || location.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={handleNavigation}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start gap-3"
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Button>
            </Link>
          );
        })}

        {/* Notifications */}
        <Link href="/comunidade/notificacoes" onClick={handleNavigation}>
          <Button
            variant={location === "/comunidade/notificacoes" ? "secondary" : "ghost"}
            className="w-full justify-start gap-3"
          >
            <Bell className="h-5 w-5" />
            Notificacoes
            {unreadCount && unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        </Link>

        {/* Creator Section */}
        {creatorProfile && creatorProfile.status === "approved" && (
          <>
            <div className="pt-4 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Criadora
              </p>
            </div>
            {creatorNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href} onClick={handleNavigation}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3"
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </>
        )}

        {/* Become Creator */}
        {user && !creatorProfile && (
          <div className="pt-4">
            <Link href="/comunidade/tornar-criadora" onClick={handleNavigation}>
              <Button variant="outline" className="w-full gap-2">
                <PlusCircle className="h-4 w-4" />
                Tornar-se Criadora
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* User Section */}
      {user && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar>
              <AvatarImage src={creatorProfile?.avatarUrl || undefined} />
              <AvatarFallback>
                {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {creatorProfile?.displayName || user.name || "Usuario"}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/comunidade/perfil" className="flex-1" onClick={handleNavigation}>
              <Button variant="ghost" size="sm" className="w-full gap-2">
                <User className="h-4 w-4" />
                Perfil
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </aside>
  );
}

export default function CommunityLayout({ children }: CommunityLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b h-14 flex items-center px-4">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link href="/comunidade" className="ml-3">
          <h1 className="text-lg font-bold text-primary">Hayah</h1>
        </Link>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar className="hidden lg:flex w-64 fixed left-0 top-0 bottom-0" />

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 pt-14 lg:pt-0 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
