import { Award, BookOpen, Users } from 'lucide-react';

export function AboutAuthor() {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Foto da Autora */}
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl shadow-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-8xl font-bold mb-4">AS</div>
                    <div className="text-2xl">Alexsandra Sardinha</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-6 max-w-xs">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-6 w-6 text-pink-600" />
                  <span className="font-semibold">Autora Best-Seller</span>
                </div>
                <p className="text-sm text-gray-600">
                  Reconhecida internacionalmente por seu trabalho em desenvolvimento pessoal
                </p>
              </div>
            </div>
            
            {/* Conteúdo */}
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold mb-4">Sobre a Autora</h2>
                <h3 className="text-2xl text-pink-600 font-semibold mb-4">Alexsandra Sardinha</h3>
              </div>
              
              <p className="text-lg text-gray-700 leading-relaxed">
                Alexsandra Sardinha é coach de vida, palestrante motivacional e autora best-seller 
                com mais de 15 anos de experiência ajudando mulheres a transformarem suas vidas. 
                Sua abordagem única combina sabedoria prática com estratégias comprovadas de 
                desenvolvimento pessoal e prosperidade financeira.
              </p>
              
              <p className="text-lg text-gray-700 leading-relaxed">
                Formada em Psicologia e com certificações internacionais em coaching, Alexsandra 
                já impactou a vida de milhares de mulheres através de seus livros, palestras e 
                programas de mentoria.
              </p>
              
              <div className="grid sm:grid-cols-3 gap-6 pt-6">
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <BookOpen className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">5+</div>
                    <div className="text-sm text-gray-600">Livros Publicados</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <Users className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">50k+</div>
                    <div className="text-sm text-gray-600">Vidas Impactadas</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-white rounded-lg p-4 shadow-md">
                    <Award className="h-8 w-8 text-pink-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">15+</div>
                    <div className="text-sm text-gray-600">Anos de Experiência</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
