/**
 * Página inicial (placeholder).
 *
 * Estrutura mínima para validar o setup do frontend. Nos próximos
 * passos, será substituída pelo site Cinema Noir completo (hero,
 * sobre, trabalhos, serviços, instagram, depoimentos e contato).
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-ink-deep flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-amber-light text-xs tracking-widest2 uppercase mb-4">
          Videomaker &amp; Storymaker · João Pessoa
        </p>
        <h1 className="font-serif font-light text-paper text-5xl md:text-7xl leading-none">
          Luiza<span className="text-amber">.</span>
        </h1>
        <p className="text-paper/50 mt-6 font-sans text-sm">
          Site em construção — setup do frontend concluído.
        </p>
      </div>
    </main>
  );
}
