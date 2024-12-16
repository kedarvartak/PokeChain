// App.js
import { motion } from 'framer-motion';
import { SparklesIcon, BoltIcon, CubeIcon } from '@heroicons/react/24/solid';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { WalletProvider } from './context/WalletContext';
import { PokemonProvider } from './context/PokemonContext'; // Add this
import { useWallet } from './context/WalletContext';
import { usePokemon } from './context/PokemonContext';
import StarterPokemon from './components/StarterPokemon'; // Add this
import Landing from './pages/Landing';
import PokemonCard from './components/PokemonCard';
// Game Content Component
const GameContent = () => {
  const { isConnected } = useWallet();
  const { isNewUser, loading, userPokemon } = usePokemon();

  if (!isConnected) {
    return <Landing />;
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <h2 className="text-4xl font-black mb-4 bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          LOADING...
        </h2>
      </div>
    );
  }

  if (isNewUser === true) {
    return <StarterPokemon />;
  }

  if (!userPokemon || userPokemon.length === 0) {
    return (
      <div className="text-center py-20 pt-36">
        <h2 className="text-4xl font-black mb-4 bg-[#FF6B6B] inline-block border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          NO POKEMON FOUND
        </h2>
        <p className="text-xl font-bold mt-4">Something went wrong loading your Pokemon team.</p>
      </div>
    );
  }

  return (
    <div className="py-20 max-w-7xl mx-auto pt-36 px-4">
      {/* Team Header */}
      <div className="text-center mb-12">
        <h2 className="text-4xl font-black inline-block bg-[#FFD93D] border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          YOUR POKEMON TEAM
        </h2>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: "TOTAL POKEMON", value: userPokemon.length },
          { label: "HIGHEST LEVEL", value: Math.max(...userPokemon.map(p => p.level)) },
          { label: "TOTAL XP", value: userPokemon.reduce((sum, p) => sum + p.xp, 0) },
          { label: "BATTLES WON", value: "0" }
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className="bg-white border-4 border-black p-4 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
          >
            <h4 className="font-black text-lg mb-2">{stat.label}</h4>
            <p className="text-3xl font-black text-[#FF6B6B]">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Pokemon Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {userPokemon.map((pokemon, idx) => (
          <PokemonCard key={idx} pokemon={pokemon} />
        ))}
      </div>
    </div>
  );
};

function App() {
  return (
    <WalletProvider>
      <PokemonProvider>
        <div className="min-h-screen bg-[#FFF3E4]">
          <Navbar />
          <GameContent />
          <Footer />
        </div>
      </PokemonProvider>
    </WalletProvider>
  );
}

export default App;