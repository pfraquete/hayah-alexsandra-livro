import { Check } from 'lucide-react';

export function AboutAuthor() {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 items-center">

          {/* Left Column - Photo & Bio */}
          <div className="text-center">
            <div className="w-[190px] h-[190px] rounded-full bg-gradient-to-br from-[#fce3ee] to-[#f9d0e0] mx-auto mb-6 relative overflow-hidden shadow-[0_18px_45px_rgba(232,115,165,0.35)]">
              <img
                src="/assets/images/author-promo.jpg"
                alt="Alexsandra Sardinha"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-xs uppercase tracking-[0.18em] text-[var(--rosa-principal)] mb-2 font-semibold">
              Sobre a autora
            </div>
            <h3 className="font-serif text-2xl mb-4 text-[var(--texto-escuro)]">Alexsandra Sardinha</h3>
            <p className="text-[var(--texto-suave)] text-sm leading-relaxed max-w-sm mx-auto">
              Mulher, mãe, esposa, líder e, acima de tudo, alguém que decidiu transformar suas dores em fonte de cura
              para outras mulheres. Alexsandra atua há anos mentoreando, aconselhando e caminhando ao lado de mulheres
              que desejam viver tudo o que Deus sonhou para elas.
            </p>
          </div>

          {/* Right Column - Content */}
          <div>
            <h2 className="font-serif text-3xl lg:text-[2.3rem] mb-6 text-[var(--texto-escuro)]">
              Uma voz que entende as suas dores e celebra as suas vitórias.
            </h2>
            <p className="text-[var(--texto-suave)] text-lg mb-4 leading-relaxed">
              Com uma linguagem simples, direta e cheia de sensibilidade, Alexsandra traz à tona temas como autoestima,
              identidade, vulnerabilidade, perdão e escolhas difíceis — sempre à luz da fé.
            </p>
            <p className="text-[var(--texto-escuro)] font-medium mb-8 leading-relaxed">
              Ao ler, você vai sentir como se estivesse em uma conversa íntima, sincera e sem máscaras.
            </p>

            <ul className="space-y-4">
              {[
                "Histórias reais, sem romantizar a dor.",
                "Reflexões que te levam à ação e não só à emoção.",
                "Um convite para caminhar alinhada ao propósito de Deus para você."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 relative pl-6 text-[0.95rem] text-[var(--texto-escuro)]">
                  <Check className="absolute left-0 top-1 h-4 w-4 text-[var(--rosa-principal)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
