import { galleriesCleanupService } from '../modules/galleries/galleries.cleanup.service';
import { env } from './env';

/**
 * Agendador interno de tarefas.
 *
 * Opção alternativa ao cron externo: quando CLEANUP_INTERVAL_ENABLED é
 * "true", agenda a limpeza de galerias expiradas em intervalos regulares
 * (CLEANUP_INTERVAL_HOURS) usando setInterval.
 *
 * Observações:
 *   - O timer reinicia se o servidor for reiniciado.
 *   - Em múltiplas instâncias, cada uma executaria a limpeza; para esse
 *     cenário, prefira o cron externo apontando para o endpoint.
 */
export function startScheduler(): void {
  if (env.CLEANUP_INTERVAL_ENABLED !== 'true') {
    return;
  }

  const intervalMs = env.CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000;

  console.log(
    `🧹 Limpeza interna de galerias habilitada (a cada ${env.CLEANUP_INTERVAL_HOURS}h).`,
  );

  // Executa uma vez logo na inicialização e depois periodicamente.
  const execute = async () => {
    try {
      const result = await galleriesCleanupService.run();
      if (result.galleriesExpired > 0) {
        console.log(
          `🧹 Limpeza: ${result.galleriesExpired} galeria(s) expirada(s), ${result.filesRemoved} arquivo(s) removido(s).`,
        );
      }
    } catch (error) {
      console.error('❌ Erro na limpeza automática de galerias:', error);
    }
  };

  void execute();
  setInterval(() => void execute(), intervalMs);
}
