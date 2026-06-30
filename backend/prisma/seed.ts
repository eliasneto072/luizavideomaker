import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

/**
 * Seed do banco de dados.
 *
 * Cria a conta administradora da Luiza (para acessar o painel) e alguns
 * dados de exemplo de portfólio e depoimentos, úteis para visualizar o
 * site populado em desenvolvimento.
 *
 * É idempotente: usa `upsert`/checagens para não duplicar registros
 * caso seja executado mais de uma vez.
 *
 * Execute com: npm run db:seed
 */
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...\n');

  // --- Conta administradora (Luiza) ---
  const adminName = process.env.ADMIN_NAME ?? 'Luiza';
  const adminEmail = process.env.ADMIN_EMAIL ?? 'luiza@luizavideomaker.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'mudar-esta-senha';

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {}, // não sobrescreve se já existir (preserva senha alterada)
    create: {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log(`✅ Administradora pronta: ${admin.email}`);

  // --- Portfólio de exemplo ---
  const portfolioCount = await prisma.portfolio.count();

  if (portfolioCount === 0) {
    await prisma.portfolio.createMany({
      data: [
        {
          title: 'O sim de Marina & João',
          category: 'Casamento',
          order: 1,
        },
        {
          title: 'Residência V.',
          category: 'Imobiliário',
          order: 2,
        },
        {
          title: 'Best Friend',
          category: 'Petshop',
          order: 3,
        },
        {
          title: 'Classe 2025',
          category: 'Formatura',
          order: 4,
        },
      ],
    });
    console.log('✅ Portfólio de exemplo criado (4 itens)');
  } else {
    console.log('ℹ️  Portfólio já possui itens — pulando.');
  }

  // --- Depoimentos de exemplo ---
  const testimonialsCount = await prisma.testimonial.count();

  if (testimonialsCount === 0) {
    await prisma.testimonial.createMany({
      data: [
        {
          author: 'Marina & João',
          role: 'Casamento',
          content:
            'A Luiza eternizou o nosso dia de um jeito que nem sabíamos ser possível. Choramos vendo o filme.',
          order: 1,
        },
        {
          author: 'Carlos M.',
          role: 'Imobiliária',
          content:
            'Profissionalismo do início ao fim. O vídeo do imóvel vendeu mais rápido do que esperávamos.',
          order: 2,
        },
        {
          author: 'Pet & Cia',
          role: 'Petshop parceiro',
          content:
            'Conteúdo impecável e criativo. Nossa marca cresceu muito nas redes depois dos reels dela.',
          order: 3,
        },
      ],
    });
    console.log('✅ Depoimentos de exemplo criados (3 itens)');
  } else {
    console.log('ℹ️  Depoimentos já existem — pulando.');
  }

  console.log('\n🎉 Seed concluído com sucesso!');
}

main()
  .catch((error) => {
    console.error('❌ Erro ao executar o seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
