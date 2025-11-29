import { Check } from 'lucide-react';

export function AboutAuthor() {
  return (
    <section id="sobre-autora" className="py-20 bg-[var(--rosa-pastel)] relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--rosa-principal)]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--rosa-profundo)]/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="relative mx-auto max-w-[400px] aspect-square rounded-full overflow-hidden border-8 border-white shadow-2xl">
              <div className="absolute inset-0 bg-[var(--rosa-principal)]/20 mix-blend-overlay z-10" /> {/* Pink Filter */}
              <img
                src="/assets/images/author-promo.jpg"
                alt="Alexsandra Sardinha"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Badge */}
            <div className="absolute bottom-4 right-1/2 translate-x-1/2 lg:right-10 lg:translate-x-0 bg-white px-6 py-3 rounded-full shadow-lg border border-[var(--rosa-claro)] z-20 whitespace-nowrap">
              <p className="font-serif font-bold text-[var(--rosa-profundo)]">Alexsandra Sardinha</p>
              <p className="text-xs text-[var(--texto-suave)] text-center">Autora & Mentora</p>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-6">
            <h2 className="text-4xl font-serif font-bold text-[var(--preto-suave)]">
              Quem é <span className="text-[var(--rosa-principal)]">Alexsandra Sardinha?</span>
            </h2>

            <p className="text-lg text-[var(--texto-suave)] leading-relaxed">
              Alexsandra é uma mulher apaixonada por ver outras mulheres florescerem. Com uma trajetória marcada por superação e fé,
              ela dedica sua vida a ensinar princípios de sabedoria milenar aplicados à realidade moderna.
            </p>

            <p className="text-lg text-[var(--texto-suave)] leading-relaxed">
              Fundadora do movimento "Empreendedoras do Reino", ela tem inspirado milhares de mulheres a viverem com propósito,
              equilíbrio e prosperidade, sem negociarem seus valores inegociáveis.
            </p>

            <div className="space-y-4 pt-4">
              <h3 className="font-serif text-xl font-bold text-[var(--rosa-profundo)]">Neste livro você vai encontrar:</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Vida Equilibrada",
                  "Caminho de Sabedoria",
                  "Abundância com Propósito",
                  "Crescimento Espiritual Diário"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[var(--texto-escuro)]">
                    <div className="w-5 h-5 rounded-full bg-[var(--rosa-principal)] flex items-center justify-center text-white shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
