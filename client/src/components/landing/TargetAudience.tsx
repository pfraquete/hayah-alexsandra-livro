import { Heart, Leaf, Sparkles, HandHeart } from 'lucide-react';

export function TargetAudience() {
    const items = [
        {
            icon: Heart,
            title: "Querem se reencontrar",
            description: "Mulheres que perderam a si mesmas em relacionamentos, rotinas exaustivas e expectativas dos outros."
        },
        {
            icon: Leaf,
            title: "Buscam cura emocional",
            description: "Feridas internas, rejeições e marcas do passado que ainda pesam sobre o presente."
        },
        {
            icon: Sparkles,
            title: "Precisam de um recomeço",
            description: "Novas fases, decisões difíceis, mudanças radicais — mas com propósito e direção."
        },
        {
            icon: HandHeart,
            title: "Desejam fortalecer a fé",
            description: "Uma fé viva, prática, que cabe na rotina corrida e conversa com a vida real."
        }
    ];

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="bg-[var(--rosa-claro)] rounded-[32px] p-8 lg:p-12">
                    <div className="max-w-2xl mb-12">
                        <h2 className="font-serif text-3xl lg:text-[2.3rem] mb-4 text-[var(--texto-escuro)]">
                            Este livro é para mulheres que…
                        </h2>
                        <p className="text-[var(--texto-suave)] text-lg">
                            Sentem que estão carregando muito peso sozinhas, mas sabem, lá no fundo, que foram feitas para viver algo maior.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                        {items.map((item, i) => {
                            const Icon = item.icon;
                            return (
                                <div key={i} className="bg-white rounded-[12px] p-6 shadow-[0_8px_25px_rgba(0,0,0,0.05)]">
                                    <div className="w-8 h-8 rounded-full bg-[rgba(232,115,165,0.12)] flex items-center justify-center mb-4 text-[var(--rosa-principal)]">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-serif text-lg mb-2 text-[var(--texto-escuro)]">{item.title}</h3>
                                    <p className="text-sm text-[var(--texto-suave)] leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
