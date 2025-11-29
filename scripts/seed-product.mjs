import { drizzle } from 'drizzle-orm/mysql2';
import { products } from '../drizzle/schema.js';
import 'dotenv/config';

const db = drizzle(process.env.DATABASE_URL);

async function seedProduct() {
  try {
    // Inserir o livro principal
    await db.insert(products).values({
      name: 'Mulher Sábia, Vida Próspera',
      slug: 'mulher-sabia-vida-prospera',
      description: 'Descubra os segredos para transformar sua vida financeira e pessoal. Um guia completo para mulheres que desejam prosperar em todas as áreas da vida.',
      priceCents: 6790, // R$ 67,90
      compareAtPriceCents: 8990, // R$ 89,90 (preço "de")
      stockQuantity: 1000,
      weightGrams: 300,
      widthCm: '14.00',
      heightCm: '21.00',
      depthCm: '2.00',
      imageUrl: null,
      active: true,
    });

    console.log('✅ Produto inserido com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao inserir produto:', error);
  }
}

seedProduct();
