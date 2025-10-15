import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Main Hero Section Component ---
const HeroSection = () => {
  // Stats relevant to a cricket e-commerce store
  const stats = [
    { number: '50+', label: 'Pro-Grade Bats' },
    { number: '10k+', label: 'Happy Customers' },
    { number: '25+', label: 'Top Brands' },
    { number: '24/7', label: 'Support' },
  ];

  return (
    <section className="relative min-h-[80vh] sm:min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        // A high-quality cricket image as a fallback
        poster="https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=1974&auto=format&fit=crop"
      >
        {/* You can replace this with your own video file in the /public/assets folder */}
        <source src="https://assets.mixkit.co/videos/preview/mixkit-cricket-player-hitting-the-ball-in-a-match-43821-large.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

      {/* Hero Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Top Badge */}
          <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/10 text-sm sm:text-base backdrop-blur-md border border-white/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            The Ultimate Cricket Gear Destination
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight drop-shadow-lg">
            Dominate The{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Crease
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-white/90 max-w-3xl mx-auto drop-shadow-md">
            From professional-grade English Willow bats to official team jerseys, find everything you need to elevate your game and play like a champion.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              to="/products"
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold text-base sm:text-lg hover:scale-105 transition-all duration-300 shadow-xl"
            >
              Shop All Gear
            </Link>
            <Link
              to="/products?category=bats"
              className="border border-white/40 text-white px-8 py-3 rounded-xl text-base sm:text-lg hover:bg-white/10 transition-all duration-300"
            >
              Browse Bats
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 pt-8 sm:pt-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold">{stat.number}</div>
                <div className="text-white/70 text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;