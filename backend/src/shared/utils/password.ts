import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Utilitários de senha.
 *
 * Encapsula o bcrypt para gerar e comparar hashes. As senhas nunca
 * são armazenadas em texto puro — apenas o hash vai para o banco.
 */
export const passwordUtils = {
  /** Gera o hash de uma senha em texto puro. */
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  },

  /** Compara uma senha em texto puro com um hash armazenado. */
  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  },
};
