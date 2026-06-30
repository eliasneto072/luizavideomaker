/**
 * Extensão global de tipos do Express.
 *
 * Usa "declaration merging" para adicionar a propriedade `user` ao
 * objeto Request do Express. Esse campo é preenchido pelo middleware
 * de autenticação após validar o token JWT, e fica disponível com
 * tipagem segura em qualquer controller da aplicação.
 *
 * Por ser uma declaração global (`declare global`), não precisa ser
 * importada — o TypeScript a aplica automaticamente em todo o projeto,
 * desde que o caminho esteja em `typeRoots` no tsconfig.json.
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export {};
