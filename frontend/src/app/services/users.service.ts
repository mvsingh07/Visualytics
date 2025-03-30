import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private apiUrl = 'http://192.168.1.131:8021'; // Replace this with the base URL of your backend API

  constructor(private http: HttpClient, private router: Router) {}

  fetchLoggedInUserInfo(): Observable<any> {
    const token = sessionStorage.getItem('token'); // Retrieve the JWT token from local storage
    // console.log("token in userservice namefunction:", token);
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`); // Set the Authorization header
      // console.log("Token in headers", headers);
      return this.http.get(`${this.apiUrl}/api/user`, { headers });
    } else {
      // Handle the case where token is not available
      return of(null);
    }
  }

  // fetchApplicationSettings(): Observable<any>{

  //   return this.http.get<any>(`${this.apiUrl}/appSettings`)
  //     .pipe(

  //     );
  // }

  updateDarkMode(newValue: boolean): Observable<any> {
    const token = sessionStorage.getItem('token');

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`);
      // console.log("token passedw", { token }, newValue);
      // console.log('Request URL:', `${this.apiUrl}/api/updateDarkMode`);
      return this.http.put(
        `${this.apiUrl}/api/updateDarkMode`,
        { newValue },
        { headers }
      );
    } else {
      // Handle the case where token is not available
      // console.log("Token not  passed, new name:", newValue);
      return of(null);
    }
  }

  updateUserName(newname: String): Observable<any> {
    const token = sessionStorage.getItem('token');

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`);
      console.log('token passedw', { token }, newname);
      console.log('Request URL:', `${this.apiUrl}/api/updatename`);
      return this.http.put(
        `${this.apiUrl}/api/updatename`,
        { newname },
        { headers }
      );
    } else {
      // Handle the case where token is not available
      console.log('Token not  passed, new name:', newname);
      return of(null);
    }
  }

  updateUserSettings(newValue: boolean): Observable<any> {
    const token = sessionStorage.getItem('token');

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`);
      // console.log("token passedw", { token }, newValue);
      // console.log('Request URL:', `${this.apiUrl}/api/updateDarkMode`);
      return this.http.put(
        `${this.apiUrl}/api/updateSettings`,
        { newValue },
        { headers }
      );
    } else {
      // Handle the case where token is not available
      // console.log("Token not  passed, new name:", newValue);
      return of(null);
    }
  }

  updateProfileSettings(newValue: boolean): Observable<any> {
    const token = sessionStorage.getItem('token');

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`);
      // console.log("token passedw", { token }, newValue);
      // console.log('Request URL:', `${this.apiUrl}/api/updateDarkMode`);
      return this.http.put(
        `${this.apiUrl}/api/updateProfileSettings`,
        { newValue },
        { headers }
      );
    } else {
      // Handle the case where token is not available
      // console.log("Token not  passed, new name:", newValue);
      return of(null);
    }
  }

  updateUsserSettings(isDarkMode: boolean): Observable<any> {
    const token = sessionStorage.getItem('token');

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`);
      console.log('Dark mode value saved to the database:', token, isDarkMode);

      // Log details about the HTTP request
      console.log('Request URL:', `${this.apiUrl}/api/updateSettings`);
      console.log('Request Headers:', headers);
      console.log('Request Payload:', { isDarkMode });

      return this.http.put(
        `${this.apiUrl}/api/updateSettings`,
        { isDarkMode },
        { headers }
      );
    } else {
      console.log('Toke not passed');
      return of(null);
    }
  }

  updatePassword(oldPassword: string, newPassword: string): Observable<any> {
    const token = sessionStorage.getItem('token');

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`);
      return this.http.put(
        `${this.apiUrl}/api/updatepassword`,
        { oldPassword, newPassword },
        { headers }
      );
    } else {
      return of(null);
    }
  }
}
