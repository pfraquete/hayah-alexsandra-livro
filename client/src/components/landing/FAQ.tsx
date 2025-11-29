import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export function FAQ() {
  const faqs = [
    {
      question: 'Para quem este livro é indicado?',
      answer: 'Este livro é ideal para mulheres de todas as idades que desejam transformar sua vida financeira e pessoal. Seja você iniciante ou já tenha conhecimento sobre o assunto, encontrará insights valiosos e estratégias práticas.',
    },
    {
      question: 'Qual o formato do livro?',
      answer: 'O livro está disponível em formato físico (capa comum) com 280 páginas. Enviamos para todo o Brasil através dos Correios com rastreamento.',
    },
    {
      question: 'Quanto tempo leva para receber o livro?',
      answer: 'O prazo de entrega varia de acordo com sua região. Após a confirmação do pagamento, o livro é enviado em até 2 dias úteis. O prazo de entrega dos Correios é de 5 a 15 dias úteis, dependendo da localidade.',
    },
    {
      question: 'Quais são as formas de pagamento?',
      answer: 'Aceitamos cartão de crédito (em até 12x), PIX e boleto bancário. O pagamento é processado de forma segura através da plataforma Pagar.me.',
    },
    {
      question: 'Posso comprar mais de um exemplar?',
      answer: 'Sim! Muitas leitoras compram exemplares extras para presentear amigas e familiares. No checkout, você pode selecionar a quantidade desejada.',
    },
    {
      question: 'O livro tem garantia?',
      answer: 'Sim! Se por algum motivo você não ficar satisfeita com o livro, oferecemos garantia de 30 dias. Basta entrar em contato conosco para solicitar o reembolso.',
    },
    {
      question: 'Como faço para rastrear meu pedido?',
      answer: 'Após o envio, você receberá um e-mail com o código de rastreamento. Você também pode acompanhar o status do seu pedido na área do cliente em nosso site.',
    },
    {
      question: 'Vocês enviam para todo o Brasil?',
      answer: 'Sim! Realizamos entregas para todos os estados brasileiros através dos Correios.',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Perguntas Frequentes</h2>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas sobre o livro e o processo de compra
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Ainda tem dúvidas?</p>
            <a 
              href="mailto:contato@hayahlivros.com.br" 
              className="text-pink-600 hover:text-pink-700 font-semibold"
            >
              Entre em contato conosco
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
