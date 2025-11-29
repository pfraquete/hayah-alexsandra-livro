import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useLocation } from 'wouter';
import { Hero } from '@/components/landing/Hero';
import { AboutBook } from '@/components/landing/AboutBook';
import { AboutAuthor } from '@/components/landing/AboutAuthor';
import { Testimonials } from '@/components/landing/Testimonials';
import { CTA } from '@/components/landing/CTA';
import { Footer } from '@/components/landing/Footer';
import { TargetAudience } from '@/components/landing/TargetAudience';
import { Preview } from '@/components/landing/Preview';
import { Bonus } from '@/components/landing/Bonus';
import { Offer } from '@/components/landing/Offer';
import { Guarantee } from '@/components/landing/Guarantee';

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading, isAuthenticated, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    setLocation('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--branco-rosado)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--rosa-principal)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans text-[var(--texto-escuro)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--rosa-nude)]/30 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-[var(--rosa-principal)] cursor-pointer" onClick={() => setLocation('/')}>Hayah Livros</h1>
          <div className="flex gap-3 items-center">
            {isAuthenticated ? (
              <>
                <span className="text-sm font-medium text-[var(--texto-suave)] mr-2 hidden sm:inline">
                  Olá, {user?.user_metadata?.name?.split(' ')[0] || 'Leitora'}
                </span>
                <Button
                  onClick={() => setLocation('/minha-conta/pedidos')}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[var(--rosa-principal)]/20 text-[var(--rosa-principal)] hover:bg-[var(--rosa-principal)]/5 transition-colors"
                >
                  Meus Pedidos
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="rounded-full text-[var(--texto-suave)] hover:bg-red-50 hover:text-red-500 transition-colors"
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
                  className="rounded-full text-[var(--rosa-principal)] hover:bg-[var(--rosa-principal)]/5 transition-colors font-medium"
                >
                  Entrar
                </Button>
                <Button
                  onClick={() => setLocation('/cadastro')}
                  size="sm"
                  className="rounded-full bg-[var(--rosa-principal)] text-white shadow-sm hover:shadow-md hover:-translate-y-px transition-all"
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
        <TargetAudience />
        <AboutAuthor />
        <Preview />
        <Bonus />
        <Offer />
        <Testimonials />
        <Guarantee />
        <CTA />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
