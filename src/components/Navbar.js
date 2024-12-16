// components/Navbar.js
import { motion } from 'framer-motion';
import { useState } from 'react';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  ShoppingBagIcon, 
  UserIcon, 
  DocumentTextIcon 
} from '@heroicons/react/24/solid';
import { useWallet } from '../context/WalletContext'; // Add this import

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, address, connectWallet, error } = useWallet(); // Add this hook

  const menuItems = [
    { name: 'HOME', icon: <HomeIcon className="w-6 h-6" />, href: '/' },
    { name: 'MARKETPLACE', icon: <ShoppingBagIcon className="w-6 h-6" />, href: '/marketplace' },
    { name: 'DOCS', icon: <DocumentTextIcon className="w-6 h-6" />, href: '/docs' },
    { name: 'PROFILE', icon: <UserIcon className="w-6 h-6" />, href: '/profile' },
  ];

  // Format address for display
  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };


  return (
    <nav className="fixed w-full z-50 top-0 left-0">
      {/* Desktop Navbar */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] m-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            {/* ... Logo section remains the same ... */}
            <h1 className="text-3xl font-bold">POKECHAIN</h1>

            {/* Desktop Menu Items */}
            <div className="hidden md:flex items-center space-x-6">
              {menuItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{ rotate: -2, scale: 1.05 }}
                  className={`flex items-center space-x-2 font-black px-4 py-2 ${item.color} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </motion.a>
              ))}
            </div>

            {/* Connect Wallet Button */}
            <motion.button
              whileHover={{ rotate: 2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={connectWallet}
              className="hidden md:block px-6 py-3 bg-[#4ECDC4] text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
            >
              {isConnected ? formatAddress(address) : 'CONNECT WALLET'}
            </motion.button>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`p-3 ${isOpen ? 'bg-[#FF6B6B]' : 'bg-[#4ECDC4]'} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]`}
              >
                {isOpen ? (
                  <XMarkIcon className="h-8 w-8" />
                ) : (
                  <Bars3Icon className="h-8 w-8" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isOpen ? 1 : 0,
          height: isOpen ? 'auto' : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] m-4 mt-0"
      >
        <div className="px-4 py-4 space-y-4">
          {menuItems.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              whileHover={{ scale: 1.02, x: 4 }}
              className={`flex items-center space-x-3 font-black p-3 ${item.color} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]`}
            >
              <div className="bg-white p-2 border-2 border-black">
                {item.icon}
              </div>
              <span>{item.name}</span>
            </motion.a>
          ))}
          
          {/* Mobile Connect Wallet Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={connectWallet}
            className="w-full px-6 py-4 bg-[#4ECDC4] text-black font-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
          >
            {isConnected ? formatAddress(address) : 'CONNECT WALLET'}
          </motion.button>
        </div>
      </motion.div>

      {/* Error Toast */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 right-4 bg-[#FF6B6B] text-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <p className="font-bold">{error}</p>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;