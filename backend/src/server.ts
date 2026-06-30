import 'dotenv/config';
import express from 'express';
import cors from 'cors';

/**
 * Ponto de entrada da aplicação.
 *
 * Nesta etapa inicial, sobe um servidor Express básico com um
 * health-check. As rotas dos módulos (auth, messages, etc.) e os
 * middlewares de erro serão adicionados nos próximos passos.
 */
const app = express();

app.use(cors());
app.use(express.json());

// Health-check — confirma que a API está no ar
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'luizavideomaker-api' });
});

const PORT = process.env.PORT ?? 3333;

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
});
