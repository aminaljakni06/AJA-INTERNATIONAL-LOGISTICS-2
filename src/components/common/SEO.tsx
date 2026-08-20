import React, { useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schema?: Record<string, any>;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonicalUrl = 'https://aja-logistics.com',
  ogImage = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
  schema,
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const defaultTitle = isAr
    ? 'أجا الدولية اللوجستية | خيارات شحن وحلول لوجستية عالمية'
    : 'AJA International Logistics | Moving Business Forward';

  const defaultDesc = isAr
    ? 'أجا الدولية اللوجستية هي الشريك الأول في المملكة العربية السعودية للخدمات اللوجستية، الشحن البحري والجوي، النقل البري، التخليص الجمركي، والتخزين الذكي.'
    : 'AJA International Logistics is Saudi Arabia’s premier end-to-end logistics & supply chain partner specializing in Air & Ocean Freight, GCC Land Transport, Customs Clearance, and Smart Warehousing.';

  const pageTitle = title ? `${title} | AJA Logistics` : defaultTitle;
  const pageDesc = description || defaultDesc;

  useEffect(() => {
    // 1. Update Title
    document.title = pageTitle;

    // 2. Helper to set or create meta tag
    const setMetaTag = (nameAttr: string, attrValue: string, content: string) => {
      let element = document.querySelector(`meta[${nameAttr}="${attrValue}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(nameAttr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Meta Description & Keywords
    setMetaTag('name', 'description', pageDesc);
    setMetaTag(
      'name',
      'keywords',
      isAr
        ? 'أجا اللوجستية, شحن بحري, شحن جوي, نقل بري, تخليص جمركي, تخزين, السعودية, رؤية 2030, أجا'
        : 'AJA Logistics, Sea Freight, Air Freight, Land Transport, Customs Clearance, Warehousing, Saudi Logistics, Vision 2030'
    );

    // Open Graph
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDesc);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', window.location.href || canonicalUrl);
    setMetaTag('property', 'og:site_name', isAr ? 'أجا اللوجستية' : 'AJA International Logistics');
    setMetaTag('property', 'og:locale', isAr ? 'ar_SA' : 'en_US');

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDesc);
    setMetaTag('name', 'twitter:image', ogImage);

    // 3. Inject Structured Data JSON-LD Schema
    const schemaId = 'aja-jsonld-schema';
    let scriptTag = document.getElementById(schemaId) as HTMLScriptElement | null;
    
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = schemaId;
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }

    const defaultOrganizationSchema = {
      '@context': 'https://schema.org',
      '@type': 'LogisticsService',
      name: 'AJA International Logistics',
      alternateName: 'أجا الدولية اللوجستية',
      url: 'https://aja-logistics.com',
      logo: 'https://aja-logistics.com/icon.svg',
      image: ogImage,
      description: defaultDesc,
      address: {
        '@type': 'PostalAddress',
        streetAddress: '1 Canada Square, Canary Wharf',
        addressLocality: 'London',
        addressRegion: 'Greater London',
        addressCountry: 'GB',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: '51.5049',
        longitude: '-0.0195',
      },
      telephone: '+442079460000',
      priceRange: '$$$',
      areaServed: ['SA', 'AE', 'KW', 'BH', 'QA', 'OM', 'Worldwide'],
      sameAs: [
        'https://linkedin.com/company/aja-logistics',
        'https://twitter.com/ajalogistics',
      ],
    };

    scriptTag.text = JSON.stringify(schema || defaultOrganizationSchema);
  }, [pageTitle, pageDesc, ogImage, isAr, canonicalUrl, schema]);

  return null;
};
