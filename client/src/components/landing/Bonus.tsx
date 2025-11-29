import { Headphones, FileText, Bookmark, MessageCircle } from 'lucide-react';

export function Bonus() {
    const bonuses = [
        {
            icon: Headphones,
            title: "Audiobook do 1º capítulo",
            description: "Ouça a primeira parte do livro com a própria autora te guiando nas palavras."
        },
        {
            icon: FileText,
            title: "Mini e-book de exercícios",
            description: "Atividades práticas para aplicar o conteúdo do livro na sua rotina."
        },
        {
            icon: Bookmark,
            title: "Marca-páginas exclusivo",
            description: "Um marcador físico, delicado e feminino, para acompanhar sua leitura."
        },
        {
            icon: MessageCircle,
            title: "Comunidade de mulheres",
            description: "Acesso a um grupo fechado para mulheres que estão vivendo essa mesma jornada."
        }
    ];

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="bg-[var(--branco-rosado)] rounded-[32px] p-8 lg:p-12">
                    <div className="max-w-2xl mb-12">
                        <h2 className="font-serif text-3xl lg:text-[2.3rem] mb-4 text-[var(--texto-escuro)]">
                            Bônus especiais para quem garantir na pré-venda.
                        </h2>
                        <p className="text-[var(--texto-suave)] text-lg">
                            Além do livro físico, você recebe conteúdos extras para aprofundar sua jornada.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
                        {bonuses.map((item, i) => {
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
