import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RangeService {
  private apiUrl = 'http://192.168.1.131:8021/api/dataset';

  private apiUrlrange = 'http://192.168.1.131:8021/api/rangeDataset';

  private apiUrl21 = 'http://192.168.1.131:8021';

  private apiUrlLastHour = 'http://192.168.1.131:8021/api/lasthourdataset';

  private lastHourDataSubject = new BehaviorSubject<any[]>([]);
  lastHourData$ = this.lastHourDataSubject.asObservable(); // Expose as Observable
  constructor(private http: HttpClient) {}

  public selectedTimeRangeSubject = new BehaviorSubject<{
    startDate: string;
    endDate: string;
  }>({ startDate: '', endDate: '' });
  selectedTimeRange$ = this.selectedTimeRangeSubject.asObservable();

  public allData: any[] = [];
  public rangeData: any[] = [];

  getAllData() {
    return this.http.get<any[]>(this.apiUrl).pipe(
      catchError((error) => {
        console.error(error);
        return throwError('Server Service error');
      })
    );
  }
  getLastHourData(): Observable<any> {
    return this.http.get<any>(this.apiUrlLastHour).pipe(
      tap((response) => {
        if (response.success && response.data) {
          this.lastHourDataSubject.next(response.data);
          console.log('✅ Last hour data fetched successfully.', response);
        } else {
          console.log('🚨 No data found in the last hour.');
          this.lastHourDataSubject.next([]);
        }
      }),
      catchError((error) => {
        console.error('❌ Error fetching last hour data:', error);
        return throwError('Error fetching last hour dataset');
      })
    );
  }

  getRangeData(startDate: string, endDate: string) {
    console.log('Requesting Dataset with dates:', startDate, endDate);

    // Create the HttpParams object with startDate and endDate as query parameters
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    // Pass the params object in the post method and handle errors
    return this.http.post<any[]>(this.apiUrlrange, { startDate, endDate }).pipe(
      catchError((error) => {
        console.error(error);
        return throwError('Server Service error');
      })
    );
  }

  getTodaysData(startDate: string, endDate: string): Observable<any[]> {
    const url = `${this.apiUrl21}/getTodaysData`; // Replace with the appropriate endpoint
    // You might need to adjust the payload or headers based on your API requirements
    const payload = {
      startDate: startDate,
      endDate: endDate,
    };

    return this.http.post<any[]>(url, payload);
  }

  downloadPdfRangeFilter2(queryConditions: any) {
    // Create an HttpParams object based on the queryConditions object
    let params = new HttpParams();

    if (queryConditions.startDate) {
      params = params.set('startDate', queryConditions.startDate);
    }

    if (queryConditions.endDate) {
      params = params.set('endDate', queryConditions.endDate);
    }

    if (queryConditions.selectedFileType) {
      params = params.set('selectedFileType', queryConditions.selectedFileType);
    }

    if (queryConditions.selectedTransFileType) {
      params = params.set(
        'selectedTransFileType',
        queryConditions.selectedTransFileType
      );
    }

    if (queryConditions.selectedStatusType) {
      params = params.set(
        'selectedStatusType',
        queryConditions.selectedStatusType
      );
    }

    if (queryConditions.selectedIocDomain) {
      params = params.set(
        'selectedIocDomain',
        queryConditions.selectedIocDomain
      );
    }

    // You can add more conditions for other filters here
    console.log('Query conditions:', queryConditions);

    // Make a POST request to the backend to generate and download the PDF
    this.http
      .post('http://192.168.1.131:8021/download-report', params, {
        responseType: 'blob',
      })
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        console.log('Range initiated');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  downloadPdf() {
    this.http
      .get('http://192.168.1.131:8021/download-report', {
        responseType: 'blob',
      })
      .subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        console.log('initiated');
        a.href = url;
        a.download = 'report.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      });
  }

  updateSelectedTimeRange(startDate: string, endDate: string) {
    this.selectedTimeRangeSubject.next({ startDate, endDate });
  }
}
