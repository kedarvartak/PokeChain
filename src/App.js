
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { WalletProvider } from './context/WalletContext';
import { PokemonProvider } from './context/PokemonContext'; 
import Landing from './pages/Landing';
import Marketplace from './pages/Marketplace';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MarketplaceProvider } from './context/MarketplaceContext';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <WalletProvider>
        <PokemonProvider>
          <MarketplaceProvider>
            <div className="min-h-screen bg-gray-100">
              <Navbar />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/marketplace" element={<Marketplace />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
              <Footer/>
            </div>
          </MarketplaceProvider>
        </PokemonProvider>
      </WalletProvider>
    </Router>
  );
}

export default App;