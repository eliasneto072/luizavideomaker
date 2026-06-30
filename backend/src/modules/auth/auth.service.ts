import { authRepository } from './auth.repository';
import { LoginInput } from './auth.schema';
import { passwordUtils } from '../../shared/utils/password';
import { jwtUtils } from '../../shared/utils/jwt';
import { AppError } from '../../shared/errors/AppError';

/**
 * Serviço de autenticação.
 *
 * Concentra a regra de negócio do login e da recuperação da sessão.
 * Orquestra o repositório e os utilitários de senha/token.
 */
export const authService = {
  /**
   * Autentica o usuário.
   * Valida e-mail e senha e, em caso de sucesso, retorna um token JWT
   * junto dos dados públicos do usuário (sem a senha).
   */
  async login({ email, password }: LoginInput) {
    const user = await authRepository.findByEmail(email);

    // Mensagem genérica de propósito: não revela se o e-mail existe.
    if (!user) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    const passwordMatches = await passwordUtils.compare(
      password,
      user.password,
    );

    if (!passwordMatches) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }

    const token = jwtUtils.sign({ sub: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },

  /**
   * Retorna os dados da sessão atual a partir do id do usuário
   * (extraído do token pelo middleware).
   */
  async me(userId: string) {
    const user = await authRepository.findById(userId);

    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  },
};
