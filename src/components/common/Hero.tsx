import React from 'react';
import { Hero as AjaHero } from '../hero/Hero';

export interface HeroProps {
  id?: string;
  badgeText?: string;
  title?: string;
  description?: string;
  onTrackShipment?: (trackingNum: string) => void;
  onGetQuoteClick?: () => void;
  onExploreServicesClick?: () => void;
  onNavigate?: (tab: string) => void;
  className?: string;
}

export const Hero: React.FC<HeroProps> = ({
  onTrackShipment,
  onGetQuoteClick,
  onNavigate,
}) => {
  return (
    <AjaHero
      onNavigate={onNavigate}
      onTrackShipment={(num) => onTrackShipment && onTrackShipment(num || '')}
      onGetQuoteClick={onGetQuoteClick}
    />
  );
};

export default Hero;
