import { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Marquee } from './components/Marquee';
import { Squad } from './components/Squad';
import { Alcance } from './components/Alcance';
import { Shop } from './components/Shop';
import { Footer } from './components/Footer';
import { PlayerModal } from './components/PlayerModal';
import { actores, actrices, staff, type Player } from './data/players';

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const handleClose = useCallback(() => setSelectedPlayer(null), []);

  return (
    <div className="grain-overlay">
      <Navbar />
      <Hero />
      <About />
      <Marquee />
      <Squad
        id="actores"
        title="EL PLANTEL"
        subtitle="Actores Futbol Club"
        players={actores}
        accent="blue"
        staff={staff}
        onSelectPlayer={setSelectedPlayer}
      />
      <Marquee />
      <Squad
        id="actrices"
        title="LAS JUGADORAS"
        subtitle="Actrices Futbol Club"
        players={actrices}
        accent="gold"
        onSelectPlayer={setSelectedPlayer}
      />
      <Alcance />
      <Marquee />
      <Shop />
      <Footer />
      <PlayerModal player={selectedPlayer} onClose={handleClose} />
    </div>
  );
}

export default App;
