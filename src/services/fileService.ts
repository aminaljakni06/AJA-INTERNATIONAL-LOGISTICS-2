/**
 * AJA INTERNATIONAL LOGISTICS — Enterprise File Management Service
 * Phase: Enterprise Shared Infrastructure Foundation
 * Module: Enterprise Shared Hooks & Services
 * Version: 1.0
 */

import { ServiceResult, RequestContext, FileObjectRecord } from '../types/sharedServices';
import { baseEnterpriseService } from './baseService';

class EnterpriseFileService {
  /**
   * Upload file to server or cloud storage
   */
  public async uploadFile(
    file: File,
    folder: string = 'documents',
    context?: RequestContext
  ): Promise<ServiceResult<FileObjectRecord>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const headers = baseEnterpriseService['getHeaders'](context);
    delete headers['Content-Type']; // Let browser set multipart boundary

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        return {
          success: false,
          error: `Upload failed HTTP ${response.status}`,
          errorAr: 'فشل رفع الملف',
        };
      }

      const json = await response.json();
      return {
        success: true,
        data: json.data || json,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'File upload failed',
        errorAr: 'حدث خطأ في رفع الملف',
      };
    }
  }

  /**
   * Delete uploaded file
   */
  public async deleteFile(fileId: string, context?: RequestContext): Promise<ServiceResult<boolean>> {
    return baseEnterpriseService.fetchWithContext<boolean>(
      `/api/files/${fileId}`,
      { method: 'DELETE' },
      context
    );
  }
}

export const enterpriseFileService = new EnterpriseFileService();
