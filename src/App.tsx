import { Header } from './components/Header';
import { useRevealFallback } from './hooks/useRevealFallback';
import { useThemeColor } from './hooks/useThemeColor';
import { Contact } from './sections/Contact';
import { DiagramCase } from './sections/DiagramCase';
import { Experience } from './sections/Experience';
import { Footer } from './sections/Footer';
import { Hero } from './sections/Hero';
import { HowIWork } from './sections/HowIWork';
import { SeatMapCase } from './sections/SeatMapCase';
import { Story } from './sections/Story';
import { Work } from './sections/Work';

export default function App() {
  useRevealFallback();
  useThemeColor();

  return (
    <div id="top" className="site graph-paper">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Experience />
        <Story />
        <Work />
        <SeatMapCase />
        <DiagramCase />
        <HowIWork />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
