import { ServiceType } from './quote';

export interface ServiceInfo {
  id: string;
  type?: ServiceType;
  serviceType?: ServiceType;
  slug?: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconName: string;
  featuresAr: string[];
  featuresEn: string[];
  benefitsAr?: string[];
  benefitsEn?: string[];
  processAr?: { step: number; title: string; desc: string }[];
  processEn?: { step: number; title: string; desc: string }[];
  industriesAr?: string[];
  industriesEn?: string[];
  faq?: { questionAr: string; questionEn: string; answerAr: string; answerEn: string }[];
  cta?: {
    titleAr?: string;
    titleEn?: string;
    descAr?: string;
    descEn?: string;
    buttonTextAr?: string;
    buttonTextEn?: string;
  };
}

export interface FAQItem {
  id: string;
  category: string;
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

export interface SystemNotification {
  id: string;
  userId: string;
  titleAr: string;
  titleEn?: string;
  messageAr: string;
  messageEn?: string;
  isRead: boolean;
  createdAt: string;
}

export interface CustomerMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId?: string | null;
  shipmentId?: string | null;
  quoteRequestId?: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}
