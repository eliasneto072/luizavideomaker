import { customAlphabet } from 'nanoid';

/**
 * Gerador de slug para galerias.
 *
 * Cria um código curto, único e amigável para compor o link público da
 * galeria (ex.: site.com/g/x7k9m2p4). Usa um alfabeto sem caracteres
 * ambíguos (sem 0/O, 1/l/I) para evitar confusão ao digitar/ditar.
 *
 * Com 8 caracteres e 32 símbolos possíveis, o espaço é enorme
 * (~1 trilhão de combinações), tornando o link impossível de adivinhar.
 */
const ALPHABET = '23456789abcdefghjkmnpqrstuvwxyz';
const SLUG_LENGTH = 8;

const nanoid = customAlphabet(ALPHABET, SLUG_LENGTH);

/** Gera um novo slug aleatório. */
export function generateSlug(): string {
  return nanoid();
}
