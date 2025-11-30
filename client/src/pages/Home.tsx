import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, User } from 'lucide-react';
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--rosa-claro)] transition-all duration-300 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setLocation('/')}>
            <img
              src="/assets/images/hayah-logo.png"
              alt="Hayah Livros"
              className="h-10 object-contain"
            />
            <div className="hidden md:block h-8 w-px bg-[var(--rosa-claro)]"></div>
            <span className="hidden md:block text-sm font-medium text-[var(--texto-suave)] tracking-wide uppercase">
              Empreendedoras do Reino
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-[var(--texto-escuro)] hover:text-[var(--rosa-principal)] font-medium transition-colors">Início</a>
            <a href="#sobre-autora" className="text-[var(--texto-escuro)] hover:text-[var(--rosa-principal)] font-medium transition-colors">Sobre a Autora</a>
            <a href="#sobre-livro" className="text-[var(--texto-escuro)] hover:text-[var(--rosa-principal)] font-medium transition-colors">O Livro</a>
            <Button
              onClick={() => document.getElementById('oferta')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-[var(--rosa-principal)] hover:bg-[var(--rosa-profundo)] text-white rounded-full px-6 shadow-md hover:shadow-lg transition-all"
            >
              Comprar
            </Button>
          </nav>

          <div className="flex gap-3 items-center md:hidden">
            {isAuthenticated ? (
              <Button
                onClick={() => setLocation('/dashboard')}
                variant="ghost"
                size="sm"
                className="text-[var(--rosa-principal)] font-medium"
              >
                Ir para o App
              </Button>
            ) : (
              <Button
                onClick={() => setLocation('/login')}
                variant="ghost"
                size="sm"
                className="text-[var(--rosa-principal)] font-medium"
              >
                Entrar
              </Button>
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
