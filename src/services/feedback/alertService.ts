/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise Alert Management Engine
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise User Feedback Framework
 * Version: 1.0
 */

import { AlertItem, AlertSeverity, AlertVariant } from '../../types/feedbackFramework';

type AlertSubscriber = (alerts: AlertItem[]) => void;

class EnterpriseAlertService {
  private alerts: AlertItem[] = [];
  private subscribers: Set<AlertSubscriber> = new Set();

  public subscribe(subscriber: AlertSubscriber): () => void {
    this.subscribers.add(subscriber);
    subscriber([...this.alerts]);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private notify(): void {
    this.subscribers.forEach((fn) => fn([...this.alerts]));
  }

  public showAlert(item: Omit<AlertItem, 'id'>): string {
    const id = `alert_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const alert: AlertItem = {
      ...item,
      id,
      dismissible: item.dismissible ?? true,
    };

    this.alerts.push(alert);
    this.notify();
    return id;
  }

  public showMaintenanceBanner(
    titleEn: string,
    titleAr: string,
    detailsEn?: string,
    detailsAr?: string
  ): string {
    return this.showAlert({
      severity: 'maintenance',
      variant: 'global',
      titleEn,
      titleAr,
      descriptionEn: detailsEn,
      descriptionAr: detailsAr,
      dismissible: true,
    });
  }

  public showEmergencyBanner(
    titleEn: string,
    titleAr: string,
    detailsEn?: string,
    detailsAr?: string
  ): string {
    return this.showAlert({
      severity: 'emergency',
      variant: 'sticky',
      titleEn,
      titleAr,
      descriptionEn: detailsEn,
      descriptionAr: detailsAr,
      dismissible: false,
    });
  }

  public dismissAlert(id: string): void {
    this.alerts = this.alerts.filter((a) => a.id !== id);
    this.notify();
  }

  public clearAll(): void {
    this.alerts = [];
    this.notify();
  }

  public get activeAlerts(): AlertItem[] {
    return [...this.alerts];
  }
}

export const enterpriseAlertService = new EnterpriseAlertService();
