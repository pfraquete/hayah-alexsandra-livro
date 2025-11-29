import { Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[var(--rosa-pastel)] pt-16 pb-8 border-t border-[var(--rosa-claro)]">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/images/hayah-logo.png"
                alt="Hayah Livros"
                className="h-8 object-contain"
              />
              <div className="h-6 w-px bg-[var(--rosa-profundo)]/20"></div>
              <span className="text-xs font-bold text-[var(--rosa-profundo)] uppercase tracking-wider">
                Empreendedoras<br />do Reino
              </span>
            </div>
            <p className="text-[var(--texto-suave)] text-sm leading-relaxed max-w-xs">
              Transformando vidas através da leitura e do conhecimento bíblico.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-serif font-bold text-[var(--preto-suave)] mb-4">Links Rápidos</h4>
            <ul className="space-y-2 text-sm text-[var(--texto-suave)]">
              <li><a href="#" className="hover:text-[var(--rosa-principal)] transition-colors">Início</a></li>
              <li><a href="#sobre-autora" className="hover:text-[var(--rosa-principal)] transition-colors">Sobre a Autora</a></li>
              <li><a href="#sobre-livro" className="hover:text-[var(--rosa-principal)] transition-colors">O Livro</a></li>
              <li><a href="/login" className="hover:text-[var(--rosa-principal)] transition-colors">Minha Conta</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-serif font-bold text-[var(--preto-suave)] mb-4">Conecte-se</h4>
            <a
              href="https://instagram.com/alexsandrasardinha"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[var(--texto-suave)] hover:text-[var(--rosa-principal)] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[var(--rosa-principal)]">
                <Instagram className="w-4 h-4" />
              </div>
              <span>@alexsandrasardinha</span>
            </a>
          </div>
        </div>

        <div className="border-t border-[var(--rosa-profundo)]/10 pt-8 text-center text-xs text-[var(--texto-suave)]">
          <p>&copy; {new Date().getFullYear()} Hayah Livros & Empreendedoras do Reino. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
