// ============================================================================
// HAYAH ALEXSANDRA LIVRO - COMPONENTES DA LANDING PAGE
// ============================================================================
// Arquivo: components/landing/index.tsx
// Dependências: shadcn/ui, lucide-react, tailwindcss

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  BookOpen,
  Heart,
  Sparkles,
  Check,
  ShieldCheck,
  CreditCard,
  Truck,
  ChevronRight,
  Quote,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// HEADER
// ============================================================================

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-pink-100',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">H</span>
            </div>
            <span className="font-semibold text-gray-800 hidden sm:block">
              Hayah Editora
            </span>
          </Link>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button
              asChild
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-8"
            >
              <Link href="/checkout">
                Comprar o Livro
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-pink-100">
            <Button
              asChild
              className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full"
            >
              <Link href="/checkout">Comprar o Livro</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

// ============================================================================
// HERO SECTION
// ============================================================================

interface HeroProps {
  title?: string;
  subtitle?: string;
  price?: number;
  badge?: string;
  bookImageUrl?: string;
}

export function Hero({
  title = 'Mulher Sábia, Vida Próspera',
  subtitle = 'Um ano inteiro aprendendo com Provérbios a viver com equilíbrio, abundância e graça.',
  price = 89.9,
  badge = 'Lançamento',
  bookImageUrl = '/images/book-cover.png',
}: HeroProps) {
  return (
    <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Text Content */}
          <div className="text-center md:text-left order-2 md:order-1">
            {badge && (
              <Badge className="bg-pink-600 text-white mb-4 px-4 py-1">
                {badge}
              </Badge>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {title}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-6 max-w-lg mx-auto md:mx-0">
              {subtitle}
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-8 py-6 text-lg w-full sm:w-auto"
              >
                <Link href="/checkout">
                  Quero Meu Exemplar
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              <div className="text-center sm:text-left">
                <p className="text-sm text-gray-500">Por apenas</p>
                <p className="text-2xl font-bold text-pink-600">
                  R$ {price.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 mt-8 justify-center md:justify-start">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span>Compra Segura</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck className="h-5 w-5 text-blue-600" />
                <span>Entrega Rápida</span>
              </div>
            </div>
          </div>

          {/* Book Image */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              {/* Decorative Background */}
              <div className="absolute -inset-4 bg-pink-200 rounded-full blur-3xl opacity-30" />

              {/* Book Mockup */}
              <div className="relative w-64 md:w-80 lg:w-96 aspect-[3/4] bg-gradient-to-br from-pink-100 to-pink-200 rounded-lg shadow-2xl flex items-center justify-center">
                {bookImageUrl ? (
                  <Image
                    src={bookImageUrl}
                    alt={title}
                    fill
                    className="object-cover rounded-lg"
                    priority
                  />
                ) : (
                  <div className="text-center p-8">
                    <BookOpen className="h-16 w-16 text-pink-400 mx-auto mb-4" />
                    <p className="text-pink-600 font-semibold">{title}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ABOUT AUTHOR SECTION
// ============================================================================

interface AboutAuthorProps {
  name?: string;
  bio?: string[];
  imageUrl?: string;
  credentials?: string[];
}

export function AboutAuthor({
  name = 'Alexsandra Sardinha',
  bio = [
    'Alexsandra Sardinha é escritora, palestrante e mentora de mulheres há mais de 15 anos.',
    'Com uma trajetória marcada pela busca de sabedoria e propósito, ela tem dedicado sua vida a ajudar outras mulheres a encontrarem equilíbrio entre vida pessoal, profissional e espiritual.',
    'Formada em Teologia e com especialização em Aconselhamento Cristão, Alexsandra combina conhecimento bíblico com aplicações práticas para o dia a dia.',
  ],
  imageUrl,
  credentials = [
    'Escritora e Palestrante',
    'Mentora de Mulheres',
    'Teóloga',
  ],
}: AboutAuthorProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Image */}
          <div className="flex justify-center">
            <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-pink-200">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center">
                  <span className="text-6xl text-pink-400">👩</span>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-pink-600 font-semibold mb-2">Sobre a Autora</p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {name}
            </h2>

            <div className="space-y-4 text-gray-600 mb-6">
              {bio.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Credentials */}
            <div className="flex flex-wrap gap-2">
              {credentials.map((credential, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-pink-100 text-pink-700"
                >
                  {credential}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// ABOUT BOOK SECTION
// ============================================================================

interface AboutBookProps {
  title?: string;
  description?: string[];
  features?: { icon: React.ReactNode; title: string; description: string }[];
}

export function AboutBook({
  title = 'Sobre o Livro',
  description = [
    'Mulher Sábia, Vida Próspera é um devocional diário que vai acompanhar você durante todo o ano com reflexões baseadas no livro de Provérbios.',
    'Cada dia traz uma meditação prática que ajuda a desenvolver sabedoria para todas as áreas da vida: relacionamentos, finanças, trabalho, família e espiritualidade.',
  ],
  features = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: '365 Reflexões',
      description: 'Uma meditação para cada dia do ano',
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Aplicação Prática',
      description: 'Exercícios e perguntas para reflexão',
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Baseado em Provérbios',
      description: 'Sabedoria bíblica para o dia a dia',
    },
  ],
}: AboutBookProps) {
  return (
    <section className="py-16 md:py-24 bg-pink-50">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {title}
          </h2>

          <div className="space-y-4 text-gray-600">
            {description.map((paragraph, index) => (
              <p key={index} className="text-lg">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TARGET AUDIENCE SECTION
// ============================================================================

interface TargetAudienceProps {
  title?: string;
  audiences?: string[];
}

export function TargetAudience({
  title = 'Para Quem é Este Livro?',
  audiences = [
    'Mulheres que buscam crescimento espiritual diário',
    'Quem deseja equilíbrio entre vida pessoal e profissional',
    'Leitoras que apreciam devocionais práticos',
    'Pessoas que querem se aprofundar em Provérbios',
    'Mulheres em busca de sabedoria para decisões',
    'Quem valoriza momentos de reflexão e oração',
  ],
}: TargetAudienceProps) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
          {title}
        </h2>

        <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {audiences.map((audience, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-pink-50 rounded-lg"
            >
              <div className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="h-4 w-4 text-white" />
              </div>
              <p className="text-gray-700">{audience}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

interface Testimonial {
  name: string;
  role?: string;
  content: string;
  imageUrl?: string;
  rating?: number;
}

interface TestimonialsProps {
  title?: string;
  testimonials?: Testimonial[];
}

export function Testimonials({
  title = 'O Que Estão Dizendo',
  testimonials = [
    {
      name: 'Maria Silva',
      role: 'Empresária',
      content:
        'Este livro transformou minhas manhãs. Cada reflexão me ajuda a começar o dia com o coração alinhado.',
      rating: 5,
    },
    {
      name: 'Ana Paula',
      role: 'Professora',
      content:
        'A forma como Alexsandra conecta os provérbios com situações práticas é simplesmente incrível.',
      rating: 5,
    },
    {
      name: 'Carla Santos',
      role: 'Mãe e Psicóloga',
      content:
        'Indico para todas as minhas pacientes. Um recurso valioso para desenvolver sabedoria emocional.',
      rating: 5,
    },
  ],
}: TestimonialsProps) {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-pink-50 to-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">
          {title}
        </h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg">
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="h-8 w-8 text-pink-200 mb-4" />

                {/* Rating */}
                {testimonial.rating && (
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                )}

                {/* Content */}
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.content}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    {testimonial.imageUrl ? (
                      <Image
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <span className="text-pink-600 font-semibold">
                        {testimonial.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    {testimonial.role && (
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// OFFER SECTION
// ============================================================================

interface OfferProps {
  price?: number;
  originalPrice?: number;
  bonuses?: string[];
  guaranteeDays?: number;
  paymentMethods?: string[];
}

export function Offer({
  price = 89.9,
  originalPrice,
  bonuses = [],
  guaranteeDays = 7,
  paymentMethods = ['Cartão de Crédito', 'Pix'],
}: OfferProps) {
  return (
    <section className="py-16 md:py-24 bg-pink-600">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Garanta Seu Exemplar Agora
          </h2>

          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8 md:p-12">
              {/* Price */}
              <div className="mb-8">
                {originalPrice && (
                  <p className="text-gray-400 line-through text-lg">
                    De R$ {originalPrice.toFixed(2).replace('.', ',')}
                  </p>
                )}
                <p className="text-sm text-gray-500 mb-1">Por apenas</p>
                <p className="text-5xl md:text-6xl font-bold text-pink-600">
                  R$ {price.toFixed(2).replace('.', ',')}
                </p>
                <p className="text-gray-500 mt-2">+ frete calculado no checkout</p>
              </div>

              {/* Bonuses */}
              {bonuses.length > 0 && (
                <div className="mb-8">
                  <p className="font-semibold text-gray-900 mb-3">
                    Bônus Inclusos:
                  </p>
                  <div className="space-y-2">
                    {bonuses.map((bonus, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 justify-center text-gray-600"
                      >
                        <Check className="h-5 w-5 text-green-500" />
                        <span>{bonus}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA Button */}
              <Button
                asChild
                size="lg"
                className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-12 py-6 text-lg w-full md:w-auto mb-6"
              >
                <Link href="/checkout">
                  Quero Meu Exemplar
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>

              {/* Guarantee */}
              <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                <span>Garantia de {guaranteeDays} dias ou seu dinheiro de volta</span>
              </div>

              {/* Payment Methods */}
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                <CreditCard className="h-5 w-5" />
                <span>Aceitamos: {paymentMethods.join(', ')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// FOOTER
// ============================================================================

interface FooterProps {
  companyName?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
}

export function Footer({
  companyName = 'Hayah Editora',
  cnpj = '00.000.000/0001-00',
  email = 'contato@hayah.com.br',
  phone = '(11) 99999-9999',
}: FooterProps) {
  return (
    <footer className="py-12 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Logo & About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">H</span>
              </div>
              <span className="font-semibold">{companyName}</span>
            </div>
            <p className="text-gray-400 text-sm">
              Publicando livros que transformam vidas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/termos" className="hover:text-white transition">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-white transition">
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/trocas" className="hover:text-white transition">
                  Trocas e Devoluções
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contato</h4>
            <ul className="space-y-2 text-gray-400">
              <li>{email}</li>
              <li>{phone}</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} {companyName}. Todos os direitos
            reservados.
          </p>
          <p className="mt-1">CNPJ: {cnpj}</p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// LANDING PAGE COMPLETA
// ============================================================================

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <AboutAuthor />
      <AboutBook />
      <TargetAudience />
      <Testimonials />
      <Offer />
      <Footer />
    </main>
  );
}

export default LandingPage;
