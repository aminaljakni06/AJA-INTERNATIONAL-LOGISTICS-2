import React from 'react';
import { BackgroundEffects } from './BackgroundEffects';
import { HeroContent } from './HeroContent';
import { HeroActions } from './HeroActions';
import { ServiceHighlights } from './ServiceHighlights';
import { CinematicLogisticsHero } from './CinematicLogisticsHero';
import { ServiceTicker } from './ServiceTicker';
import { useAuth } from '../../context/AuthContext';

export interface HeroProps {
  onNavigate?: (tab: string) => void;
  onTrackShipment?: (trackingNum?: string) => void;
  onGetQuoteClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onNavigate,
  onTrackShipment,
  onGetQuoteClick,
}) => {
  const { user } = useAuth();

  const handleGetQuote = () => {
    if (onGetQuoteClick) onGetQuoteClick();
    else if (onNavigate) onNavigate('quote-request');
  };

  const handleTrackShipment = (num?: string) => {
    if (onTrackShipment) onTrackShipment(num || '');
    else if (onNavigate) onNavigate('tracking');
  };

  const handleSignIn = () => {
    if (onNavigate) {
      if (user) {
        onNavigate(user.role === 'CUSTOMER' ? 'customer-dashboard' : 'admin-dashboard');
      } else {
        onNavigate('login');
      }
    }
  };

  return (
    <div className="relative min-h-svh w-full bg-[#030712] text-white overflow-hidden flex flex-col justify-between pt-20">
      {/* Layered Background Effects */}
      <BackgroundEffects />

      {/* Main Hero Section Viewport Composition */}
      <main className="relative z-10 w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Headline, Eyebrow, Description, CTAs & Service Highlights */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6 sm:space-y-8 z-20">
            <HeroContent />

            {/* Primary Actions */}
            <HeroActions
              onGetQuoteClick={handleGetQuote}
              onTrackShipmentClick={handleTrackShipment}
              onSignInClick={handleSignIn}
            />

            {/* Service Highlights */}
            <ServiceHighlights />
          </div>

          {/* Right Column: Cinematic Real-World Logistics Hero Player */}
          <div className="lg:col-span-7 xl:col-span-7 w-full z-10">
            <CinematicLogisticsHero />
          </div>
        </div>
      </main>

      {/* Bottom Service Ticker */}
      <ServiceTicker />
    </div>
  );
};

export default Hero;
