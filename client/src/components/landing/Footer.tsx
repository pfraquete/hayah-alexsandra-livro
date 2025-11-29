import { Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Sobre */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Hayah Livros</h3>
            <p className="text-sm leading-relaxed mb-4">
              Editora dedicada a publicar conteúdo transformador para mulheres que 
              desejam prosperar em todas as áreas da vida.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-pink-600 p-2 rounded-lg transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-800 hover:bg-pink-600 p-2 rounded-lg transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Links Rápidos */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="hover:text-pink-400 transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="/#sobre-livro" className="hover:text-pink-400 transition-colors">
                  Sobre o Livro
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-pink-400 transition-colors">
                  Minha Conta
                </a>
              </li>
              <li>
                <a href="/checkout" className="hover:text-pink-400 transition-colors">
                  Comprar
                </a>
              </li>
            </ul>
          </div>
          
          {/* Suporte */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Suporte</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-pink-400 transition-colors">
                  Central de Ajuda
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-400 transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-400 transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-pink-400 transition-colors">
                  Política de Reembolso
                </a>
              </li>
            </ul>
          </div>
          
          {/* Contato */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contato</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                <a href="mailto:contato@hayahlivros.com.br" className="hover:text-pink-400 transition-colors">
                  contato@hayahlivros.com.br
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                <span>(11) 99999-9999</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-pink-400 flex-shrink-0 mt-0.5" />
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} Hayah Livros. Todos os direitos reservados.</p>
          <p className="mt-2 text-gray-500">
            Desenvolvido com 💗 para transformar vidas
          </p>
        </div>
      </div>
    </footer>
  );
}
