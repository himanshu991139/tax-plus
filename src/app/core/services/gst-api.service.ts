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
  // the proxy to localhost:8081, prod through the configured backend origin.
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
    return this.postConvertForm(this.convertUrl, formData);
  }

  /**
   * Converts Amazon MTR (Merchant Tax Report) B2C data into GSTR-1 JSON.
   */
  convertAmazon(formData: FormData): Observable<Gstr1Payload> {
    const amazonUrl = apiUrl('/api/v1/gst/convert-amazon');
    return this.postConvertForm(amazonUrl, formData);
  }

  /**
   * Combines Meesho and Amazon GSTR-1 payloads via backend API POST /api/v1/gst/combine
   */
  combinePayloads(meesho: Gstr1Payload, amazon: Gstr1Payload): Observable<Gstr1Payload> {
    const combineUrl = apiUrl('/api/v1/gst/combine');
    return this.http.post<Gstr1Payload>(combineUrl, { meesho, amazon }).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Failed to combine platform reports.';
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
   * Fast client-side combination of Meesho and Amazon payloads into a unified GSTR-1 payload.
   */
  combinePayloadsLocally(meesho: Gstr1Payload, amazon: Gstr1Payload): Gstr1Payload {
    if (!meesho && !amazon) return {} as Gstr1Payload;
    if (!meesho) return amazon;
    if (!amazon) return meesho;

    const roundVal = (v: number) => Math.round(v * 100) / 100;

    // 1. Merge Table 7: B2CS items
    const b2csMap = new Map<string, any>();
    const addItems = (items: any[]) => {
      if (!items) return;
      for (const item of items) {
        const key = `${item.pos}_${item.rt}`;
        if (!b2csMap.has(key)) {
          b2csMap.set(key, {
            sply_ty: item.sply_ty,
            rt: item.rt,
            typ: item.typ || 'OE',
            pos: item.pos,
            txval: 0,
            iamt: 0,
            camt: 0,
            samt: 0,
            csamt: 0,
          });
        }
        const b = b2csMap.get(key);
        b.txval = roundVal(b.txval + (item.txval || 0));
        if (item.iamt) b.iamt = roundVal(b.iamt + item.iamt);
        if (item.camt) b.camt = roundVal(b.camt + item.camt);
        if (item.samt) b.samt = roundVal(b.samt + item.samt);
      }
    };

    addItems(meesho.b2cs || []);
    addItems(amazon.b2cs || []);

    const combinedB2cs = Array.from(b2csMap.values())
      .filter((b) => b.txval !== 0)
      .sort((a, b) => a.pos.localeCompare(b.pos))
      .map((b) => {
        const rate = Number(b.rt) || 18;
        const res: any = {
          sply_ty: b.sply_ty,
          rt: b.rt,
          typ: b.typ,
          pos: b.pos,
          txval: b.txval,
        };
        if (b.sply_ty === 'INTRA') {
          const calculatedHalf = roundVal(b.txval * (rate / 200));
          res.camt = b.camt !== 0 ? roundVal(b.camt) : calculatedHalf;
          res.samt = b.samt !== 0 ? roundVal(b.samt) : calculatedHalf;
        } else {
          const calculatedTax = roundVal(b.txval * (rate / 100));
          res.iamt = b.iamt !== 0 ? roundVal(b.iamt) : calculatedTax;
        }
        res.csamt = 0;
        return res;
      });

    // 2. Merge Table 12: HSN Summary (Amazon HSN first, then Meesho HSN)
    const allHsn = [...(amazon.hsn?.hsn_b2c || []), ...(meesho.hsn?.hsn_b2c || [])];
    const combinedHsn = allHsn.map((h, i) => ({ ...h, num: i + 1 }));

    // 3. Merge Table 14: SUPECO (Amazon ECO first, then Meesho ECO)
    const combinedSupeco = [...(amazon.supeco?.clttx || []), ...(meesho.supeco?.clttx || [])];

    // 4. Merge Table 13: DOC ISSUE (doc 1 is Meesho docs, doc 2 is Amazon docs)
    const allDocs: any[] = [];
    let docSeq = 1;
    (meesho.doc_issue?.doc_det?.[0]?.docs || []).forEach((d) => allDocs.push({ ...d, num: docSeq++ }));
    (amazon.doc_issue?.doc_det?.[0]?.docs || []).forEach((d) => allDocs.push({ ...d, num: docSeq++ }));

    return {
      gstin: meesho.gstin || amazon.gstin,
      fp: meesho.fp || amazon.fp,
      version: 'GST3.2.3',
      hash: 'hash',
      b2cs: combinedB2cs,
      hsn: combinedHsn.length > 0 ? { hsn_b2c: combinedHsn } : undefined,
      supeco: combinedSupeco.length > 0 ? { clttx: combinedSupeco } : undefined,
      doc_issue:
        allDocs.length > 0
          ? {
              doc_det: [
                {
                  doc_num: 1,
                  doc_typ: 'Invoices for outward supply',
                  docs: allDocs,
                },
              ],
            }
          : undefined,
    };
  }

  /**
   * Generic helper: POSTs a multipart form to a convert endpoint with shared error handling.
   */
  private postConvertForm(url: string, formData: FormData): Observable<Gstr1Payload> {
    return this.http.post<Gstr1Payload>(url, formData).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = `Failed to convert reports.`;
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
