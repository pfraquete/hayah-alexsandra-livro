import { Check } from 'lucide-react';

export function AboutBook() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
          {/* Left Column */}
          <div>
            <div className="mb-8 max-w-2xl">
              <h2 className="font-serif text-3xl lg:text-[2.3rem] mb-4 text-[var(--texto-escuro)]">
                Um livro que cura, confronta e acolhe ao mesmo tempo.
              </h2>
              <p className="text-[var(--texto-suave)] text-lg leading-relaxed">
                Este não é apenas mais um livro de inspiração feminina. Alexsandra abre o coração e compartilha
                processos reais de dor, cura e recomeços, guiando você em uma jornada íntima com Deus e consigo mesma.
              </p>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Textos curtos e profundos, ideais para ler no dia a dia.",
                "Reflexões práticas para aplicar imediatamente na sua rotina.",
                "Histórias reais que fazem você se sentir vista, ouvida e abraçada.",
                "Espaços para anotar seus próprios processos e orações."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 relative pl-6 text-[0.95rem] text-[var(--texto-escuro)]">
                  <Check className="absolute left-0 top-1 h-4 w-4 text-[var(--rosa-principal)]" />
                  {item}
                </li>
              ))}
            </ul>

            <ul className="flex flex-wrap gap-2">
              {[
                "Identidade",
                "Autoestima",
                "Recomeços",
                "Fé prática",
                "Mulher adulta & real"
              ].map((tag, i) => (
                <li key={i} className="px-3 py-1.5 rounded-full bg-[rgba(232,115,165,0.06)] text-[0.82rem] text-[var(--texto-suave)]">
                  {tag}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column */}
          <div className="bg-[var(--branco-rosado)] rounded-[16px] p-8">
            <h3 className="font-serif text-xl mb-4 text-[var(--texto-escuro)]">Por que este livro é diferente?</h3>
            <p className="text-[var(--texto-suave)] mb-4 leading-relaxed">
              Ele foi escrito por uma mulher comum, que viveu dores reais e descobriu que Deus não chama mulheres
              perfeitas, mas mulheres dispostas. Ao longo das páginas, você vai se enxergar, chorar, sorrir e
              se reencontrar com a sua própria história.
            </p>
            <p className="text-[var(--texto-escuro)] font-medium leading-relaxed">
              É como sentar para conversar com uma amiga que já passou pela tempestade e hoje te ajuda a atravessar a sua.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
