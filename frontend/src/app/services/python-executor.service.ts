import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class PythonExecutorService {
  private apiUrl = 'http://192.168.1.131:8021/run-scripts';

  constructor(private http: HttpClient) {}

  runScripts(): Observable<any> {
    return this.http.post(this.apiUrl, {});
  }
}
