import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Hero } from '../../components/common/Hero';
import { SEO } from '../../components/common/SEO';
import { CTA } from '../../components/common/CTA';
import {
  TrustedBySection,
  CoreServicesSection,
  WhyChooseAjaSection,
  GlobalLogisticsSolutionsSection,
  IndustriesServedSection,
  InteractiveTrackingSection,
  DigitalPlatformSection,
  StatisticsSection,
  InteractiveWorldMapSection,
  CustomerTestimonialsSection,
  PartnersCertificationsSection,
  LatestNewsSection,
} from '../../components/home';

interface HomePageProps {
  onNavigate: (tab: string) => void;
  onTrackShipment: (trackingNum: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onTrackShipment }) => {
  const { isAr } = useLanguage();

  return (
    <div className="bg-[#030712] min-h-screen text-white space-y-0">
      <SEO
        title={
          isAr
            ? 'أجا الدولية اللوجستية | خيارات شحن وحلول لوجستية عالمية'
            : 'AJA International Logistics | Global Freight & Supply Chain'
        }
      />

      {/* 1. Hero Section */}
      <Hero
        onTrackShipment={onTrackShipment}
        onGetQuoteClick={() => onNavigate('quote-request')}
        onExploreServicesClick={() => onNavigate('services')}
        onNavigate={onNavigate}
      />

      {/* 2. Trusted By Global Leaders */}
      <TrustedBySection />

      {/* 3. Core Services Section */}
      <CoreServicesSection
        onNavigate={onNavigate}
        onRequestQuote={() => onNavigate('quote-request')}
      />

      {/* 4. Why Choose AJA Logistics */}
      <WhyChooseAjaSection onNavigate={onNavigate} />

      {/* 5. Global Logistics Solutions */}
      <GlobalLogisticsSolutionsSection onNavigate={onNavigate} />

      {/* 6. Industries We Serve */}
      <IndustriesServedSection onNavigate={onNavigate} />

      {/* 7. Interactive Shipment Tracking */}
      <InteractiveTrackingSection
        onTrackShipment={onTrackShipment}
        onNavigate={onNavigate}
      />

      {/* 8. Digital Logistics Platform */}
      <DigitalPlatformSection onNavigate={onNavigate} />

      {/* 9. Key Statistics & Achievements */}
      <StatisticsSection />

      {/* 10. Interactive World Map & Network */}
      <InteractiveWorldMapSection onNavigate={onNavigate} />

      {/* 11. Customer Testimonials */}
      <CustomerTestimonialsSection />

      {/* 12. Partners & Certifications */}
      <PartnersCertificationsSection />

      {/* 13. Latest News & Insights */}
      <LatestNewsSection onNavigate={onNavigate} />

      {/* 14. Global Call to Action */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <CTA
          title={
            isAr
              ? 'جاهز لبدء شحن بضائعك بذكاء وأمان وسرعة؟'
              : 'Ready to Streamline Your Enterprise Supply Chain?'
          }
          description={
            isAr
              ? 'احصل على عرض سعر مخصص وربط مباشر مع أساطيلنا وحاوياتنا الشاملة عبر شبكتنا العالمية.'
              : 'Get a customized quote and seamlessly connect with our global shipping network in minutes.'
          }
          onQuoteClick={() => onNavigate('quote-request')}
        />
      </div>
    </div>
  );
};


