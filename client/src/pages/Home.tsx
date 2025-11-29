import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation } from 'wouter';
import { Hero } from '@/components/landing/Hero';
import { AboutBook } from '@/components/landing/AboutBook';
import { AboutAuthor } from '@/components/landing/AboutAuthor';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setLocation('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-pink-600">Hayah Livros</h1>
          <div className="flex gap-2 items-center">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">
                  Olá, {user?.user_metadata?.name || user?.email}
                </span>
                <Button onClick={() => setLocation('/minha-conta/pedidos')} variant="outline" size="sm">
                  Meus Pedidos
                </Button>
                <Button onClick={handleLogout} variant="ghost" size="sm">
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button onClick={() => setLocation('/login')} variant="ghost" size="sm">
                  Entrar
                </Button>
                <Button onClick={() => setLocation('/cadastro')} className="bg-pink-600 hover:bg-pink-700" size="sm">
                  Cadastrar
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <Hero />
        <AboutBook />
        <AboutAuthor />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
