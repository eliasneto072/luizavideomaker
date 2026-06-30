/**
 * Erro de aplicação.
 *
 * Representa erros esperados de negócio (ex.: "credenciais inválidas",
 * "registro não encontrado"). Carrega um código de status HTTP para que
 * o middleware de erro responda corretamente ao cliente.
 *
 * Erros não previstos (bugs) não usam esta classe e são tratados como
 * 500 pelo middleware.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';

    // Mantém o stack trace correto (necessário ao estender Error em TS)
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
