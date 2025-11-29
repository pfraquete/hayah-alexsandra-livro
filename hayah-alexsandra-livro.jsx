import React, { useState, useEffect } from 'react';

// ============================================
// SISTEMA COMPLETO: MULHER SÁBIA, VIDA PRÓSPERA
// Landing Page + Checkout + Área do Cliente + Admin
// ============================================

// Dados mockados
const BOOK_DATA = {
  title: "Mulher Sábia, Vida Próspera",
  author: "Alexsandra Sardinha",
  subtitle: "Um ano inteiro aprendendo com Provérbios a viver com equilíbrio, abundância e graça",
  price: 89.90,
  originalPrice: 129.90,
  description: "Uma jornada transformadora através do livro de Provérbios, projetada especialmente para mulheres que desejam viver com sabedoria, propósito e prosperidade em todas as áreas da vida.",
};

const MOCK_ORDERS = [
  { id: "PED-2024-001", date: "2024-11-25", status: "ENTREGUE", total: 109.80, tracking: "BR123456789" },
  { id: "PED-2024-002", date: "2024-11-28", status: "EM_TRANSITO", total: 99.90, tracking: "BR987654321" },
];

const MOCK_ADMIN_ORDERS = [
  { id: "PED-001", customer: "Maria Silva", email: "maria@email.com", phone: "11999999999", date: "2024-11-28", total: 109.80, status: "PAGO", paymentMethod: "PIX", shippingType: "SEDEX", shippingPrice: 19.90 },
  { id: "PED-002", customer: "Ana Costa", email: "ana@email.com", phone: "21988888888", date: "2024-11-28", total: 99.90, status: "EM_SEPARACAO", paymentMethod: "CARTAO", shippingType: "PAC", shippingPrice: 15.90 },
  { id: "PED-003", customer: "Julia Santos", email: "julia@email.com", phone: "31977777777", date: "2024-11-27", total: 89.90, status: "POSTADO", paymentMethod: "PIX", shippingType: "PAC", shippingPrice: 12.90, tracking: "BR111222333" },
  { id: "PED-004", customer: "Carla Mendes", email: "carla@email.com", phone: "41966666666", date: "2024-11-26", total: 119.80, status: "ENTREGUE", paymentMethod: "CARTAO", shippingType: "SEDEX", shippingPrice: 29.90, tracking: "BR444555666" },
];

// Componentes de UI Base
const Button = ({ children, variant = "primary", size = "md", className = "", ...props }) => {
  const baseStyles = "font-semibold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95";
  const variants = {
    primary: "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40",
    secondary: "bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20",
    outline: "border-2 border-pink-500 text-pink-600 hover:bg-pink-50",
    ghost: "text-pink-600 hover:bg-pink-50",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };
  
  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Input = ({ label, error, className = "", ...props }) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <input
      className={`w-full px-4 py-3 rounded-xl border-2 border-pink-100 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 transition-all outline-none ${error ? 'border-red-400' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-sm text-red-500">{error}</p>}
  </div>
);

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-3xl shadow-xl shadow-pink-100/50 p-6 ${className}`}>
    {children}
  </div>
);

// Ícones SVG
const Icons = {
  Book: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Heart: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  Star: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Truck: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  CreditCard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Package: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Chart: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  ),
  WhatsApp: () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  Printer: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  ),
};

// ============================================
// LANDING PAGE
// ============================================
const LandingPage = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const testimonials = [
    { name: "Maria Fernanda", text: "Esse livro transformou minha forma de ver a vida. Cada capítulo é um presente de sabedoria.", stars: 5 },
    { name: "Carolina Silva", text: "A Alexsandra tem uma forma única de ensinar. Me sinto acolhida em cada página.", stars: 5 },
    { name: "Patricia Souza", text: "Não é apenas um livro, é uma jornada de transformação. Recomendo a toda mulher!", stars: 5 },
  ];

  const benefits = [
    "365 dias de reflexões baseadas em Provérbios",
    "Exercícios práticos para aplicar no dia a dia",
    "Orações direcionadas para cada momento",
    "Espaço para anotações e insights pessoais",
    "Design especial com capa dura premium",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-serif text-xl text-gray-800">Hayah</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#sobre" className="text-gray-600 hover:text-pink-600 transition-colors">Sobre</a>
            <a href="#beneficios" className="text-gray-600 hover:text-pink-600 transition-colors">Benefícios</a>
            <a href="#depoimentos" className="text-gray-600 hover:text-pink-600 transition-colors">Depoimentos</a>
            <Button onClick={() => onNavigate('checkout')} size="sm">Comprar Agora</Button>
          </nav>
          <button className="md:hidden p-2" onClick={() => onNavigate('checkout')}>
            <Icons.Menu />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative">
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full text-sm font-medium">
              <span className="animate-pulse">🎉</span>
              Lançamento • Pré-Venda Especial
            </div>
            
            <h1 className="font-serif text-5xl lg:text-7xl text-gray-900 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-600">Mulher Sábia</span>
              <br />
              Vida Próspera
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              {BOOK_DATA.subtitle}
            </p>
            
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-gray-900">R$ {BOOK_DATA.price.toFixed(2).replace('.', ',')}</span>
              <span className="text-xl text-gray-400 line-through">R$ {BOOK_DATA.originalPrice.toFixed(2).replace('.', ',')}</span>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                -30%
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => onNavigate('checkout')} size="xl" className="group">
                <span className="flex items-center gap-2">
                  Garantir Meu Exemplar
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Button>
              <Button variant="outline" size="xl" onClick={() => onNavigate('login')}>
                Já sou cliente
              </Button>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                <Icons.Truck />
                Frete Grátis Brasil
              </span>
              <span className="flex items-center gap-2">
                <Icons.CreditCard />
                12x sem juros
              </span>
            </div>
          </div>
          
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="relative z-10">
              {/* Book mockup */}
              <div className="relative mx-auto w-80 transform hover:rotate-2 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-pink-600 rounded-2xl blur-2xl opacity-30 animate-pulse" />
                <div className="relative bg-gradient-to-br from-pink-100 to-rose-100 rounded-2xl p-8 shadow-2xl">
                  <div className="aspect-[3/4] bg-gradient-to-br from-rose-300 to-pink-400 rounded-xl flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-4 right-4 w-32 h-32 border border-white/30 rounded-full" />
                      <div className="absolute bottom-4 left-4 w-24 h-24 border border-white/30 rounded-full" />
                    </div>
                    <div className="relative text-center">
                      <p className="text-sm mb-2 opacity-80">Alexsandra Sardinha</p>
                      <h3 className="font-serif text-2xl leading-tight mb-2">Mulher Sábia</h3>
                      <h3 className="font-serif text-2xl leading-tight">Vida Próspera</h3>
                      <div className="mt-4 w-16 h-0.5 bg-white/50 mx-auto" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Author photo overlay */}
            <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 p-1 shadow-xl hidden lg:block">
              <div className="w-full h-full rounded-full bg-pink-200 flex items-center justify-center">
                <span className="text-5xl">👩</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Author */}
      <section id="sobre" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-200 to-pink-300 rounded-3xl transform rotate-6" />
              <div className="absolute inset-0 bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl flex items-center justify-center">
                <span className="text-8xl">👩‍💼</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <span className="text-pink-600 font-medium">Sobre a Autora</span>
            <h2 className="font-serif text-4xl text-gray-900">Alexsandra Sardinha</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Alexsandra Sardinha é esposa, mãe e apaixonada por ver mulheres alcançarem seu potencial pleno. 
              Com mais de 15 anos de experiência em ministério feminino, ela tem dedicado sua vida a ensinar 
              princípios bíblicos de forma prática e transformadora.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Através do ministério Hayah, ela já impactou milhares de mulheres em todo o Brasil, 
              levando uma mensagem de esperança, propósito e prosperidade baseada na Palavra de Deus.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="text-center">
                <span className="block text-3xl font-bold text-pink-600">15+</span>
                <span className="text-sm text-gray-500">Anos de Ministério</span>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <span className="block text-3xl font-bold text-pink-600">10k+</span>
                <span className="text-sm text-gray-500">Vidas Impactadas</span>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div className="text-center">
                <span className="block text-3xl font-bold text-pink-600">5</span>
                <span className="text-sm text-gray-500">Filhos</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="py-20 px-4 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-pink-600 font-medium">O que você vai encontrar</span>
            <h2 className="font-serif text-4xl text-gray-900 mt-2">Um ano de transformação</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-lg shadow-pink-100/50 hover:shadow-xl transition-shadow group">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  <Icons.Check />
                </div>
                <p className="text-gray-700 font-medium">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-pink-600 font-medium">Depoimentos</span>
            <h2 className="font-serif text-4xl text-gray-900 mt-2">O que estão dizendo</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <Card key={i} className="hover:scale-105 transition-transform">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(t.stars)].map((_, j) => <Icons.Star key={j} />)}
                </div>
                <p className="text-gray-600 mb-4 italic">"{t.text}"</p>
                <p className="font-medium text-gray-900">{t.name}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-br from-rose-500 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 border-2 border-white rounded-full" />
          <div className="absolute bottom-10 right-10 w-96 h-96 border-2 border-white rounded-full" />
        </div>
        
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="font-serif text-4xl lg:text-5xl mb-6">
            Comece sua jornada de transformação hoje
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Garanta seu exemplar com desconto especial de lançamento + frete grátis para todo o Brasil.
          </p>
          <Button 
            onClick={() => onNavigate('checkout')} 
            variant="secondary" 
            size="xl"
            className="bg-white text-pink-600 hover:bg-white/90"
          >
            Quero Garantir o Meu Agora
          </Button>
          <p className="mt-6 text-sm opacity-75">
            Pagamento seguro • Satisfação garantida • Envio imediato
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-serif text-xl">Hayah</span>
          </div>
          <p className="text-gray-400 mb-4">
            © 2024 Hayah Ministério. Todos os direitos reservados.
          </p>
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// ============================================
// CHECKOUT
// ============================================
const CheckoutPage = ({ onNavigate }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', cpf: '', phone: '', password: '',
    cep: '', street: '', number: '', complement: '', district: '', city: '', state: '',
    shippingMethod: 'pac',
    paymentMethod: 'pix'
  });
  const [loading, setLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState([
    { id: 'pac', name: 'PAC', price: 15.90, days: '8-12 dias úteis' },
    { id: 'sedex', name: 'SEDEX', price: 29.90, days: '3-5 dias úteis' },
  ]);

  const shippingPrice = shippingOptions.find(s => s.id === formData.shippingMethod)?.price || 0;
  const total = BOOK_DATA.price + shippingPrice;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCepBlur = async () => {
    if (formData.cep.length === 8) {
      // Simula busca de CEP
      setFormData({
        ...formData,
        street: 'Rua das Flores',
        district: 'Centro',
        city: 'São Paulo',
        state: 'SP'
      });
    }
  };

  const handleSubmit = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onNavigate('success');
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors">
            <Icons.ArrowLeft />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white text-sm font-bold">
              H
            </div>
            <span className="font-serif text-lg text-gray-800">Checkout Seguro</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Progress Steps */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                step >= s ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step > s ? <Icons.Check /> : s}
              </div>
              {s < 3 && <div className={`w-16 h-1 mx-2 rounded ${step > s ? 'bg-pink-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-8 text-sm text-gray-500 mb-8">
          <span className={step >= 1 ? 'text-pink-600 font-medium' : ''}>Cadastro</span>
          <span className={step >= 2 ? 'text-pink-600 font-medium' : ''}>Endereço</span>
          <span className={step >= 3 ? 'text-pink-600 font-medium' : ''}>Pagamento</span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif text-gray-900 mb-6">Seus dados</h2>
                  <Input label="Nome completo" name="name" value={formData.name} onChange={handleChange} placeholder="Digite seu nome" />
                  <Input label="E-mail" name="email" type="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="CPF" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" />
                    <Input label="WhatsApp" name="phone" value={formData.phone} onChange={handleChange} placeholder="(00) 00000-0000" />
                  </div>
                  <Input label="Criar senha" name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Mínimo 6 caracteres" />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif text-gray-900 mb-6">Endereço de entrega</h2>
                  <Input label="CEP" name="cep" value={formData.cep} onChange={handleChange} onBlur={handleCepBlur} placeholder="00000-000" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <Input label="Rua" name="street" value={formData.street} onChange={handleChange} placeholder="Nome da rua" />
                    </div>
                    <Input label="Número" name="number" value={formData.number} onChange={handleChange} placeholder="123" />
                  </div>
                  <Input label="Complemento" name="complement" value={formData.complement} onChange={handleChange} placeholder="Apto, bloco, etc (opcional)" />
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Bairro" name="district" value={formData.district} onChange={handleChange} />
                    <Input label="Cidade" name="city" value={formData.city} onChange={handleChange} />
                    <Input label="Estado" name="state" value={formData.state} onChange={handleChange} />
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="font-medium text-gray-900 mb-4">Escolha o frete</h3>
                    <div className="space-y-3">
                      {shippingOptions.map(option => (
                        <label key={option.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.shippingMethod === option.id ? 'border-pink-400 bg-pink-50' : 'border-gray-100 hover:border-pink-200'
                        }`}>
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shippingMethod"
                              value={option.id}
                              checked={formData.shippingMethod === option.id}
                              onChange={handleChange}
                              className="w-5 h-5 text-pink-600"
                            />
                            <div>
                              <span className="font-medium text-gray-900">{option.name}</span>
                              <span className="text-sm text-gray-500 ml-2">{option.days}</span>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">R$ {option.price.toFixed(2).replace('.', ',')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-serif text-gray-900 mb-6">Forma de pagamento</h2>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === 'pix' ? 'border-pink-400 bg-pink-50' : 'border-gray-100 hover:border-pink-200'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={formData.paymentMethod === 'pix'}
                        onChange={handleChange}
                        className="w-5 h-5 text-pink-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">PIX</span>
                        <p className="text-sm text-gray-500">Aprovação instantânea</p>
                      </div>
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">5% OFF</span>
                    </label>
                    
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.paymentMethod === 'card' ? 'border-pink-400 bg-pink-50' : 'border-gray-100 hover:border-pink-200'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={formData.paymentMethod === 'card'}
                        onChange={handleChange}
                        className="w-5 h-5 text-pink-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">Cartão de Crédito</span>
                        <p className="text-sm text-gray-500">Em até 12x sem juros</p>
                      </div>
                    </label>
                  </div>

                  {formData.paymentMethod === 'card' && (
                    <div className="space-y-4 pt-4">
                      <Input label="Número do cartão" placeholder="0000 0000 0000 0000" />
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Validade" placeholder="MM/AA" />
                        <Input label="CVV" placeholder="123" />
                      </div>
                      <Input label="Nome no cartão" placeholder="Como está no cartão" />
                    </div>
                  )}
                </div>
              )}

              <div className="mt-8">
                <Button onClick={handleSubmit} size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </span>
                  ) : step === 3 ? 'Finalizar Compra' : 'Continuar'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-32">
              <h3 className="font-serif text-xl text-gray-900 mb-6">Resumo do pedido</h3>
              
              <div className="flex gap-4 pb-6 border-b border-gray-100">
                <div className="w-20 h-28 bg-gradient-to-br from-rose-200 to-pink-300 rounded-lg flex items-center justify-center">
                  <Icons.Book />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{BOOK_DATA.title}</h4>
                  <p className="text-sm text-gray-500">{BOOK_DATA.author}</p>
                  <p className="text-lg font-semibold text-pink-600 mt-2">R$ {BOOK_DATA.price.toFixed(2).replace('.', ',')}</p>
                </div>
              </div>
              
              <div className="py-6 space-y-3 border-b border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>R$ {BOOK_DATA.price.toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Frete ({formData.shippingMethod.toUpperCase()})</span>
                  <span>R$ {shippingPrice.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>
              
              <div className="pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-pink-600">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                {formData.paymentMethod === 'card' && (
                  <p className="text-sm text-gray-500 mt-2 text-right">
                    ou 12x de R$ {(total / 12).toFixed(2).replace('.', ',')}
                  </p>
                )}
              </div>
              
              <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                <span className="text-green-500">🔒</span>
                Compra 100% segura
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// SUCCESS PAGE
// ============================================
const SuccessPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
            <Icons.Check />
          </div>
        </div>
        
        <h1 className="font-serif text-3xl text-gray-900 mb-4">Compra Realizada!</h1>
        <p className="text-gray-600 mb-6">
          Seu pedido foi confirmado com sucesso. Você receberá um e-mail com os detalhes e 
          uma mensagem no WhatsApp com as atualizações do envio.
        </p>
        
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Número do pedido</p>
          <p className="text-xl font-mono font-bold text-gray-900">PED-2024-003</p>
        </div>
        
        <div className="space-y-3">
          <Button onClick={() => onNavigate('account')} className="w-full">
            Acompanhar meu pedido
          </Button>
          <Button onClick={() => onNavigate('landing')} variant="outline" className="w-full">
            Voltar à loja
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ============================================
// LOGIN PAGE
// ============================================
const LoginPage = ({ onNavigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-6">
          <Icons.ArrowLeft />
          Voltar
        </button>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
            H
          </div>
          <h1 className="font-serif text-2xl text-gray-900">{isLogin ? 'Entrar na conta' : 'Criar conta'}</h1>
        </div>
        
        <div className="space-y-4">
          {!isLogin && <Input label="Nome completo" placeholder="Seu nome" />}
          <Input label="E-mail" type="email" placeholder="seu@email.com" />
          <Input label="Senha" type="password" placeholder="Sua senha" />
          
          <Button onClick={() => onNavigate('account')} className="w-full" size="lg">
            {isLogin ? 'Entrar' : 'Criar conta'}
          </Button>
        </div>
        
        <p className="text-center text-gray-500 mt-6">
          {isLogin ? 'Não tem conta?' : 'Já tem conta?'}
          <button onClick={() => setIsLogin(!isLogin)} className="text-pink-600 font-medium ml-1 hover:underline">
            {isLogin ? 'Criar agora' : 'Entrar'}
          </button>
        </p>
      </Card>
    </div>
  );
};

// ============================================
// CUSTOMER ACCOUNT
// ============================================
const AccountPage = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState('orders');
  
  const getStatusColor = (status) => {
    const colors = {
      'PAGO': 'bg-blue-100 text-blue-700',
      'EM_SEPARACAO': 'bg-yellow-100 text-yellow-700',
      'EM_TRANSITO': 'bg-purple-100 text-purple-700',
      'ENTREGUE': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };
  
  const getStatusLabel = (status) => {
    const labels = {
      'PAGO': 'Pago',
      'EM_SEPARACAO': 'Em separação',
      'EM_TRANSITO': 'Em trânsito',
      'ENTREGUE': 'Entregue',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => onNavigate('landing')} className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-bold">
              H
            </div>
            <span className="font-serif text-xl text-gray-800">Minha Conta</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Olá, Maria!</span>
            <button onClick={() => onNavigate('landing')} className="text-gray-500 hover:text-pink-600">
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'orders' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Meus Pedidos
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-2 font-medium transition-colors ${
              activeTab === 'profile' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Meus Dados
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {MOCK_ORDERS.map(order => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-gradient-to-br from-rose-200 to-pink-300 rounded-lg flex items-center justify-center">
                      <Icons.Book />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{BOOK_DATA.title}</p>
                      <p className="text-sm text-gray-500">Pedido {order.id}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <p className="font-semibold text-gray-900">R$ {order.total.toFixed(2).replace('.', ',')}</p>
                    {order.tracking && (
                      <a href={`https://www.linkcorreios.com.br/?id=${order.tracking}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-sm text-pink-600 hover:underline flex items-center gap-1">
                        <Icons.Truck />
                        Rastrear: {order.tracking}
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'profile' && (
          <Card>
            <h2 className="text-xl font-serif text-gray-900 mb-6">Meus dados</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Input label="Nome completo" value="Maria Silva" />
              <Input label="E-mail" value="maria@email.com" />
              <Input label="CPF" value="123.456.789-00" />
              <Input label="WhatsApp" value="(11) 99999-9999" />
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h3 className="font-medium text-gray-900 mb-4">Endereço de entrega</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <Input label="CEP" value="01310-100" />
                <div className="md:col-span-2"><Input label="Rua" value="Av. Paulista, 1000" /></div>
                <Input label="Bairro" value="Bela Vista" />
                <Input label="Cidade/UF" value="São Paulo - SP" />
              </div>
            </div>
            <div className="mt-6">
              <Button>Salvar alterações</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// ============================================
// ADMIN DASHBOARD
// ============================================
const AdminPage = ({ onNavigate }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Chart },
    { id: 'orders', label: 'Pedidos', icon: Icons.Package },
    { id: 'contacts', label: 'Contatos', icon: Icons.User },
    { id: 'stock', label: 'Estoque', icon: Icons.Book },
  ];

  const stats = [
    { label: 'Faturamento Hoje', value: 'R$ 1.290,00', change: '+12%', positive: true },
    { label: 'Pedidos Hoje', value: '8', change: '+3', positive: true },
    { label: 'Ticket Médio', value: 'R$ 107,50', change: '-5%', positive: false },
    { label: 'Estoque Atual', value: '234 un.', change: '-12', positive: false },
  ];
  
  const getStatusColor = (status) => {
    const colors = {
      'PAGO': 'bg-blue-100 text-blue-700',
      'EM_SEPARACAO': 'bg-yellow-100 text-yellow-700',
      'POSTADO': 'bg-purple-100 text-purple-700',
      'EM_TRANSITO': 'bg-indigo-100 text-indigo-700',
      'ENTREGUE': 'bg-green-100 text-green-700',
      'PROBLEMA': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const toggleOrderSelection = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handlePrintLabels = () => {
    alert(`Gerando etiquetas para ${selectedOrders.length} pedido(s)...`);
    setSelectedOrders([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center text-white font-bold">
              H
            </div>
            <div>
              <span className="font-serif text-lg text-white">Hayah</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>
        
        <nav className="p-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeSection === item.id 
                  ? 'bg-pink-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <item.icon />
              {item.label}
            </button>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <button 
            onClick={() => onNavigate('landing')} 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Icons.ArrowLeft />
            Voltar à loja
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-4 py-4 flex items-center justify-between">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2">
              <Icons.Menu />
            </button>
            <h1 className="text-xl font-semibold text-gray-900 capitalize">{activeSection}</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Admin</span>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Dashboard */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                  <Card key={i}>
                    <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <span className={`text-sm ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </Card>
                ))}
              </div>

              {/* Recent Orders */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h2>
                  <button onClick={() => setActiveSection('orders')} className="text-pink-600 text-sm hover:underline">
                    Ver todos
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3">Pedido</th>
                        <th className="pb-3">Cliente</th>
                        <th className="pb-3">Data</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ADMIN_ORDERS.slice(0, 5).map(order => (
                        <tr key={order.id} className="border-b border-gray-50">
                          <td className="py-3 font-medium">{order.id}</td>
                          <td className="py-3 text-gray-600">{order.customer}</td>
                          <td className="py-3 text-gray-500">{order.date}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 text-right font-medium">R$ {order.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Orders */}
          {activeSection === 'orders' && (
            <div className="space-y-4">
              {/* Actions Bar */}
              <Card className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
                    <option>Todos os status</option>
                    <option>Pago</option>
                    <option>Em separação</option>
                    <option>Postado</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Buscar pedido..." 
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm w-64"
                  />
                </div>
                {selectedOrders.length > 0 && (
                  <Button onClick={handlePrintLabels} size="sm" className="flex items-center gap-2">
                    <Icons.Printer />
                    Imprimir {selectedOrders.length} etiqueta(s)
                  </Button>
                )}
              </Card>

              {/* Orders Table */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b">
                        <th className="pb-3 pr-4">
                          <input 
                            type="checkbox" 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedOrders(MOCK_ADMIN_ORDERS.filter(o => o.status === 'PAGO').map(o => o.id));
                              } else {
                                setSelectedOrders([]);
                              }
                            }}
                            className="w-4 h-4"
                          />
                        </th>
                        <th className="pb-3">Pedido</th>
                        <th className="pb-3">Cliente</th>
                        <th className="pb-3">Data</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Frete</th>
                        <th className="pb-3 text-right">Valor</th>
                        <th className="pb-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_ADMIN_ORDERS.map(order => (
                        <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 pr-4">
                            <input 
                              type="checkbox" 
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => toggleOrderSelection(order.id)}
                              disabled={order.status !== 'PAGO'}
                              className="w-4 h-4"
                            />
                          </td>
                          <td className="py-3 font-medium">{order.id}</td>
                          <td className="py-3">
                            <div>
                              <p className="text-gray-900">{order.customer}</p>
                              <p className="text-xs text-gray-500">{order.phone}</p>
                            </div>
                          </td>
                          <td className="py-3 text-gray-500">{order.date}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="py-3 text-gray-600 text-sm">
                            {order.shippingType}
                            {order.tracking && <p className="text-xs text-pink-600">{order.tracking}</p>}
                          </td>
                          <td className="py-3 text-right font-medium">R$ {order.total.toFixed(2)}</td>
                          <td className="py-3 text-right">
                            <div className="flex justify-end gap-2">
                              <button className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="WhatsApp">
                                <Icons.WhatsApp />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Contacts */}
          {activeSection === 'contacts' && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Contatos</h2>
                <Button size="sm" variant="outline">Exportar CSV</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3">Nome</th>
                      <th className="pb-3">E-mail</th>
                      <th className="pb-3">WhatsApp</th>
                      <th className="pb-3">Origem</th>
                      <th className="pb-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_ADMIN_ORDERS.map(order => (
                      <tr key={order.id} className="border-b border-gray-50">
                        <td className="py-3 font-medium">{order.customer}</td>
                        <td className="py-3 text-gray-600">{order.email}</td>
                        <td className="py-3 text-gray-600">{order.phone}</td>
                        <td className="py-3"><span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs">Compra</span></td>
                        <td className="py-3">
                          <button className="text-green-600 hover:text-green-700">
                            <Icons.WhatsApp />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Stock */}
          {activeSection === 'stock' && (
            <div className="space-y-4">
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Produtos</h2>
                  <Button size="sm">Adicionar Produto</Button>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-3">Produto</th>
                      <th className="pb-3">SKU</th>
                      <th className="pb-3">Preço</th>
                      <th className="pb-3">Estoque</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-16 bg-gradient-to-br from-rose-200 to-pink-300 rounded-lg flex items-center justify-center">
                            <Icons.Book />
                          </div>
                          <div>
                            <p className="font-medium">Mulher Sábia, Vida Próspera</p>
                            <p className="text-sm text-gray-500">Alexsandra Sardinha</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-600 font-mono">MSVP-001</td>
                      <td className="py-4 font-medium">R$ 89,90</td>
                      <td className="py-4">
                        <span className="text-2xl font-bold text-gray-900">234</span>
                        <span className="text-sm text-gray-500 ml-1">un.</span>
                      </td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Ativo
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card>

              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Movimentações Recentes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-medium">Entrada de estoque</p>
                      <p className="text-xs text-gray-500">28/11/2024</p>
                    </div>
                    <span className="text-green-600 font-medium">+50 un.</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-medium">Venda #PED-001</p>
                      <p className="text-xs text-gray-500">28/11/2024</p>
                    </div>
                    <span className="text-red-600 font-medium">-1 un.</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-50">
                    <div>
                      <p className="text-sm font-medium">Venda #PED-002</p>
                      <p className="text-xs text-gray-500">28/11/2024</p>
                    </div>
                    <span className="text-red-600 font-medium">-1 un.</span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// ============================================
// MAIN APP - ROUTER
// ============================================
export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  
  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const pages = {
    landing: <LandingPage onNavigate={navigate} />,
    checkout: <CheckoutPage onNavigate={navigate} />,
    success: <SuccessPage onNavigate={navigate} />,
    login: <LoginPage onNavigate={navigate} />,
    account: <AccountPage onNavigate={navigate} />,
    admin: <AdminPage onNavigate={navigate} />,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        .font-serif {
          font-family: 'Cormorant Garamond', serif;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      
      {pages[currentPage]}
      
      {/* Admin access button (floating) */}
      {currentPage === 'landing' && (
        <button
          onClick={() => navigate('admin')}
          className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-full text-sm shadow-lg hover:bg-gray-800 transition-colors z-50"
        >
          🔐 Admin
        </button>
      )}
    </>
  );
}
