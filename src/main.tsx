import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Fonts: Fraunces roman + italic (opsz + wght axes), JetBrains Mono roman (wght axis). Latin subsets load on demand via unicode-range.
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource-variable/jetbrains-mono/wght.css';
import './styles/tokens.css';
import './styles/global.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
