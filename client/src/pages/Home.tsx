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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-white/10 backdrop-blur-md supports-[backdrop-filter]:bg-white/5 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gradient cursor-pointer" onClick={() => setLocation('/')}>Hayah Livros</h1>
          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-foreground/80 mr-2 hidden sm:inline">
                  Olá, {user?.user_metadata?.name?.split(' ')[0] || 'Leitora'}
                </span>
                <Button
                  onClick={() => setLocation('/minha-conta/pedidos')}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                >
                  Meus Pedidos
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setLocation('/login')}
                  variant="ghost"
                  size="sm"
                  className="rounded-full hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => setLocation('/cadastro')}
                  size="sm"
                  className="rounded-full shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-0.5"
                >
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
