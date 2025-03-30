import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://192.168.1.131:8021'; // Replace this with the base URL of your backend API

  constructor(private http: HttpClient, private router: Router) {}

  fetchLoggedInAdminInfo(): Observable<any> {
    const token = sessionStorage.getItem('token'); // Replace 'adminToken' with the key you use for admin JWT token in local storage
    // console.log("Admin token in admin service for fetching name:", token);

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`); // Set the Authorization header
      // console.log("Token in admin service headers:", headers);

      return this.http.get(`${this.apiUrl}/api/admin`, { headers });
    } else {
      // Handle the case where token is not available
      return of(null);
    }
  }
}
