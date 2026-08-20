import React, { useState, useEffect } from 'react';
import { ServiceData, SERVICES_DATA, getServiceBySlug } from '../../data/services';
import { ServicesGrid } from '../../components/services/ServicesGrid';
import { ServiceDetailPage } from '../../components/services/ServiceDetailPage';
import { SEO } from '../../components/common/SEO';

interface ServicesPageProps {
  onNavigate: (tab: string, serviceSlug?: string) => void;
  initialFilter?: string;
  slug?: string;
}

export const ServicesPage: React.FC<ServicesPageProps> = ({ 
  onNavigate, 
  initialFilter = 'all', 
  slug 
}) => {
  const [selectedService, setSelectedService] = useState<ServiceData | null>(
    slug ? (getServiceBySlug(slug) || null) : null
  );

  useEffect(() => {
    if (slug) {
      const match = getServiceBySlug(slug);
      if (match) {
        setSelectedService(match);
      }
    } else if (initialFilter && initialFilter !== 'all') {
      const match = getServiceBySlug(initialFilter);
      if (match) {
        setSelectedService(match);
      } else {
        setSelectedService(null);
      }
    } else {
      setSelectedService(null);
    }
  }, [slug, initialFilter]);

  const serviceSchema = selectedService ? {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: selectedService.titleAr || selectedService.title,
    provider: {
      '@type': 'LogisticsService',
      name: 'AJA International Logistics',
    },
    description: selectedService.descriptionAr || selectedService.description,
    areaServed: 'SA',
  } : undefined;

  const pageTitle = selectedService 
    ? (selectedService.titleAr || selectedService.title) 
    : 'خدمات الشحن والحلول اللوجستية | Services';

  if (selectedService) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SEO title={pageTitle} schema={serviceSchema} />
        <ServiceDetailPage
          service={selectedService}
          onBack={() => setSelectedService(null)}
          onNavigateToQuote={(serviceSlug) => onNavigate('quote-request', serviceSlug || selectedService.slug)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SEO title={pageTitle} />
      <ServicesGrid
        initialCategory={initialFilter}
        onSelectService={(service) => setSelectedService(service)}
        onNavigateToQuote={(serviceSlug) => onNavigate('quote-request', serviceSlug)}
      />
    </div>
  );
};
