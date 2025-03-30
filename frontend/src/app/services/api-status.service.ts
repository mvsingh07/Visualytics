import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface ApiStatus {
  status: string;
}

@Injectable({
  providedIn: 'root',
})
export class ApiStatusService {
  private backendUrl = 'http://192.168.1.131:8021/check-status'; // Node.js backend URL

  constructor(private http: HttpClient) {}

  checkApiStatus(url: string): Observable<ApiStatus> {
    const payload = { url };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post<ApiStatus>(this.backendUrl, payload, { headers })
      .pipe(
        map((response) => {
          console.log('API Response:', response); // Log the response
          // Check the response status and return accordingly
          if (response.status === 'Operational') {
            return { status: 'Operational' } as ApiStatus;
          } else {
            return { status: 'Down' } as ApiStatus;
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error occurred:', error); // Log detailed error
          // If connection is made but an error occurs, still set status to "Operational"
          if (error.status === 0) {
            // Handle case where there's no connection at all
            return of({ status: 'Down' } as ApiStatus);
          } else {
            // Connection was made, but an error occurred
            return of({ status: 'Down' } as ApiStatus);
          }
        })
      );
  }
}
