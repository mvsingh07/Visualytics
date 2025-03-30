import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new Subject<number>();

  // Observable for components to subscribe to
  notification$ = this.notificationSubject.asObservable();

  constructor(private http: HttpClient) {}

  // // Method to send notification to components
  sendNotification(count: number) {
    this.notificationSubject.next(count);
  }

  private apiUrl = 'http://192.168.1.131:8021/api/appOperations';

  getNotificationCount(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
