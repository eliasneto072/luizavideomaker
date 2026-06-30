import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { prisma } from './config/prisma';

/**
 * Ponto de entrada da aplicação.
 *
 * Sobe o servidor Express com as configurações básicas e um
 * health-check que também verifica a conexão com o banco de dados.
 * As rotas dos módulos e o middleware de erro serão adicionados
 * nos próximos passos.
 */
const app = express();

app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());

// Health-check — confirma que a API e o banco estão no ar
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', service: 'luizavideomaker-api', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(env.PORT, () => {
  console.log(`🚀 API rodando em ${env.API_URL}`);
});
