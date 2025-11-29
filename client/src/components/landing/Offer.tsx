import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useLocation } from 'wouter';

export function Offer() {
    const [, setLocation] = useLocation();

    return (
        <section id="comprar" className="py-16 lg:py-24">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-[1fr_1fr] gap-12 items-center">

                    {/* Left Column */}
                    <div>
                        <div className="mb-8 max-w-xl">
                            <h2 className="font-serif text-3xl lg:text-[2.3rem] mb-4 text-[var(--texto-escuro)]">
                                Garanta o seu exemplar com preço especial de lançamento.
                            </h2>
                            <p className="text-[var(--texto-suave)] text-lg leading-relaxed">
                                Nesta primeira tiragem, você tem acesso a um valor exclusivo, mais bônus e prioridade no envio.
                            </p>
                        </div>

                        <ul className="space-y-4">
                            {[
                                "Livro físico, em capa premium, enviado para todo o Brasil.",
                                "Código de rastreio e acompanhamento do pedido.",
                                "Pagamento seguro via cartão, Pix ou boleto."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3 relative pl-6 text-[0.95rem] text-[var(--texto-escuro)]">
                                    <Check className="absolute left-0 top-1 h-4 w-4 text-[var(--rosa-principal)]" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Column - Price Card */}
                    <div className="bg-white rounded-[22px] p-8 shadow-[0_18px_40px_rgba(232,115,165,0.18)] max-w-[420px] mx-auto lg:mx-0 w-full">
                        <div className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(232,115,165,0.08)] text-[var(--rosa-principal)] mb-4">
                            Pré-venda limitada
                        </div>

                        <h3 className="text-lg font-medium text-[var(--texto-escuro)]">Investimento</h3>

                        <div className="flex items-baseline gap-3 my-2">
                            <span className="text-[0.9rem] text-[#b88c9b] line-through">R$ 69,90</span>
                            <span className="text-[2.5rem] font-bold text-[var(--rosa-principal)]">R$ 49,90</span>
                        </div>

                        <p className="text-sm text-[var(--texto-suave)] mb-6">
                            Valor especial de lançamento para as primeiras leitoras.
                        </p>

                        <Button
                            className="w-full rounded-full py-6 text-base font-semibold bg-[var(--rosa-principal)] hover:bg-[var(--rosa-principal)]/90 text-white shadow-lg hover:shadow-xl transition-all mb-3 cursor-pointer"
                            onClick={() => setLocation('/produto')}
                        >
                            Comprar agora
                        </Button>

                        <p className="text-xs text-center text-[#a17c8e]">
                            Frete calculado no checkout. Pagamento processado com segurança.
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}
