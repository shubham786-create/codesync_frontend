import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import Footer from '../components/landing/Footer';

export default function LandingPage({ isAuthenticated = false }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17]">
      <Navbar isAuthenticated={isAuthenticated} />
      <main className="flex-1">
        <Hero isAuthenticated={isAuthenticated} />
        <Features />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
