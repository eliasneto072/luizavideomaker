import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { prisma } from './config/prisma';
import { routes } from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

/**
 * Ponto de entrada da aplicação.
 *
 * Configura o Express, registra as rotas da API sob o prefixo `/api`
 * e o middleware global de erros (sempre por último).
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

// Rotas da aplicação
app.use('/api', routes);

// Tratamento global de erros (deve ser o último middleware)
app.use(errorMiddleware);

app.listen(env.PORT, () => {
  console.log(`🚀 API rodando em ${env.API_URL}`);
});
