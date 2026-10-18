import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Gstr1Payload, Gstr1Summary } from '../models/gstr1.model';
import { CompanyEntity, CompanyDto } from '../models/client-info.model';
import { apiUrl } from '../config/app-config';

@Injectable({
  providedIn: 'root',
})
export class GstApiService {
  private readonly http = inject(HttpClient);
  // Resolved from runtime config (public/api-config.json): dev routes through
  // the proxy to localhost:8080, prod through the configured backend origin.
  private readonly convertUrl = apiUrl('/api/v1/gst/convert-meesho');
  private readonly companiesUrl = apiUrl('/api/companies');

  /**
   * Fetches all registered companies from backend GET /api/companies
   */
  getCompanies(): Observable<CompanyEntity[]> {
    return this.http.get<CompanyEntity[]>(this.companiesUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to load companies from backend.';
        if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Creates a new company in backend POST /api/companies
   */
  createCompany(dto: CompanyDto): Observable<CompanyEntity> {
    return this.http.post<CompanyEntity>(this.companiesUrl, dto).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to create company.';
        if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Deletes a company by ID via DELETE /api/companies/{id}
   */
  deleteCompany(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.companiesUrl}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to delete company.';
        if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Sets a company as the default profile via PUT /api/companies/{id}/default
   */
  setDefaultCompany(id: number | string): Observable<CompanyEntity> {
    return this.http.put<CompanyEntity>(`${this.companiesUrl}/${id}/default`, {}).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to set default profile.';
        if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Sends multipart form data to convert Meesho reports into GSTR-1 JSON
   */
  convertMeesho(formData: FormData): Observable<Gstr1Payload> {
    return this.http.post<Gstr1Payload>(this.convertUrl, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to convert Meesho reports.';
        if (error.error && typeof error.error === 'object' && error.error.message) {
          errorMessage = error.error.message;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Helper to load a sample file from the public assets as a File object
   */
  async loadSampleFile(path: string, fileName: string, mimeType: string): Promise<File> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load sample file at ${path}`);
    }
    const blob = await response.blob();
    return new File([blob], fileName, { type: mimeType });
  }

  /**
   * Computes key metrics from a GSTR-1 payload
   */
  calculateSummary(payload: Gstr1Payload): Gstr1Summary {
    let totalTaxableValue = 0;
    let totalIgst = 0;
    let totalCgst = 0;
    let totalSgst = 0;

    if (payload.b2cs && payload.b2cs.length > 0) {
      for (const item of payload.b2cs) {
        totalTaxableValue += item.txval || 0;
        totalIgst += item.iamt || 0;
        totalCgst += item.camt || 0;
        totalSgst += item.samt || 0;
      }
    }

    let totalInvoices = 0;
    let totalCancelled = 0;
    let netInvoices = 0;

    if (payload.doc_issue?.doc_det) {
      for (const det of payload.doc_issue.doc_det) {
        if (det.docs) {
          for (const doc of det.docs) {
            totalInvoices += doc.totnum || 0;
            totalCancelled += doc.cancel || 0;
            netInvoices += doc.net_issue || 0;
          }
        }
      }
    }

    return {
      totalTaxableValue: Math.round(totalTaxableValue * 100) / 100,
      totalIgst: Math.round(totalIgst * 100) / 100,
      totalCgst: Math.round(totalCgst * 100) / 100,
      totalSgst: Math.round(totalSgst * 100) / 100,
      totalTax: Math.round((totalIgst + totalCgst + totalSgst) * 100) / 100,
      totalInvoices,
      totalCancelled,
      netInvoices,
      posCount: payload.b2cs?.length || 0,
    };
  }

  /**
   * Triggers a browser download of the JSON payload
   */
  downloadJsonFile(data: Gstr1Payload, filename?: string): void {
    const name = filename || `GSTR1_Meesho_${data.fp || 'return'}.json`;
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
