import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

/**
 * Estrutura de rotas do site.
 *
 * Três frentes convivem no mesmo app:
 *   /            → site público (portfólio da Luiza)
 *   /painel/*    → painel administrativo (login da Luiza) — em breve
 *   /g/:slug     → galeria do cliente (link + senha) — em breve
 *
 * Por enquanto, apenas a home pública está montada; as demais rotas
 * serão adicionadas nos próximos passos.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}
