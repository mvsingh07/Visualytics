import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UsersService } from './users.service';
import { tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

interface LoginResponse {
  userName: string;
  token: string;
  userType: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://192.168.1.131:8021'; // Replace this with the base URL of your backend API

  private userRole: string | null = null; // Initialize to null
  private refreshInterval: number | undefined;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) {}

  registerUser(user: {
    email: string;
    password: string;
    name: string;
    userType: string;
  }): Observable<any> {
    // Send a POST request to the /signup route of your backend API
    return this.http.post<any>(`${this.apiUrl}/signup`, user);
  }

  // setToken(token: string,userType:string) {
  //   sessionStorage.setItem('token', token);
  //   sessionStorage.setItem('userType', userType);
  // }

  setToken(token: string, userType: string) {
    const expiresIn = 60;
    const expirationTimestamp = Date.now() + expiresIn * 1000; // Convert expiresIn to milliseconds
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('userType', userType);
    sessionStorage.setItem('tokenExpiration', expirationTimestamp.toString());
  }

  removeToken() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('tokenExpiration');
    this.router.navigate(['']);
    this.logout();
    // this.toastr.error("Session Time over","Login In Again" )
  }

  getToken() {
    return sessionStorage.getItem('token');
  }

  isLoggedIn(): Observable<boolean> {
    // Check if the user has a valid token in local storage
    const token = this.getToken();

    return of(!!token); // Convert the boolean value to an Observable<boolean>
  }

  logout() {
    this.userRole = null;
    this.router.navigate(['']);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('tokenExpiration');
    console.warn('logout');
  }

  setupTokenRefresh(refreshTime: number): void {
    // Set a timeout to refresh the token before it expires
    setTimeout(() => {
      // Get the current token from local storage
      const token = sessionStorage.getItem('token');

      // If a token exists, initiate token refresh
      if (token) {
        console.log('Refreshing token');

        // Call the token refresh endpoint to obtain a new token
        // Replace 'refreshTokenEndpoint' with the actual endpoint URL
        this.http
          .post<any>(`${this.apiUrl}/refresh-token`, { token })
          .subscribe(
            (response) => {
              // If the token refresh is successful, update the token in local storage
              if (response && response.newToken) {
                console.log('Token refreshed successfully.');
                this.setToken(response.newToken, response.userType);
                // console.log("Token updated in session storage.");
                // schedule the next token refresh
                // this.setupTokenRefresh(refreshTime);
              }
            },
            (error) => {
              // If the token refresh fails, log the user out
              console.error('Failed to refresh token:', error);
              this.logout();
            }
          );
      }
    }, refreshTime);
  }

  // Method to initiate the password reset process
  forgotPassword(email: string): Observable<any> {
    const formData = { email }; // Create an object with the user's email
    // Send a POST request to the server's /forgot-password endpoint
    return this.http.post(`${this.apiUrl}/forgot-password`, formData);
  }

  // Method to check the validity of the reset token
  checkResetTokenValidity(resetToken: string): Observable<any> {
    // Send a GET request to the server's /forgot-password/:resetToken endpoint
    return this.http.get(`${this.apiUrl}/forgot-password/${resetToken}`);
  }

  // Method to update password using token
  updatePasswordByToken(
    resetToken: string,
    newPassword: string
  ): Observable<any> {
    console.log('Token used for password update in auth:', resetToken);
    const requestBody = { resetToken, newPassword };
    return this.http.post(
      `${this.apiUrl}/update-password-by-token`,
      requestBody
    );
  }

  navigateToResetPassword() {
    this.router.navigate(['/reset-password']);
  }

  login(email: string, password: string): Observable<any> {
    // console.log("in auth login");
    const data = { email, password };
    // Send a POST request to the server's login endpoint
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      catchError(this.handleError),
      map((response: LoginResponse) => {
        if (response && response.token) {
          const expiresIn = 1800;
          this.setToken(response.token, response.userType); // Set the token in local storage
          console.log(
            'Token set to local storage by Auth ervice login function'
          );
          this.userRole = response.userType; // Set the userRole property
        }
        return response;
      })
    );
  }

  getUserRole(): string | null {
    // Return the user's role
    const userRole = sessionStorage.getItem('userType');
    // console.log("User Logged In is ", this.userRole);
    return userRole;
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError('Something went wrong. Please try again later.');
  }

  registerAdmin(Admin: {
    email: string;
    password: string;
    name: string;
    userType: string;
  }): Observable<any> {
    // Send a POST request to the /signup route of your backend API
    return this.http.post<any>(`${this.apiUrl}/register-admin`, Admin);
  }

  isAdmin(): boolean {
    // Check if the user has the "admin" role
    return this.userRole === 'admin';
  }

  init(): void {
    this.userRole = sessionStorage.getItem('userType');
  }

  adminForgotPassword(email: string): Observable<any> {
    const formData = { email };
    return this.http.post(`${this.apiUrl}/forgot-password`, formData);
  }

  checkEmailExists(email: string): Observable<boolean> {
    // Send a GET request to the server's /check-email-exists/:email endpoint
    return this.http.get<boolean>(`${this.apiUrl}/check-email-exists/${email}`);
  }

  isUser(email: string): boolean {
    return this.userRole === 'user';
  }

  updateAdminPasswordByToken(
    resetToken: string,
    newPassword: string
  ): Observable<any> {
    console.log('Token used for admin password update in auth:', resetToken);
    const requestBody = { resetToken, newPassword };
    return this.http.post(
      `${this.apiUrl}/update-password-by-token`,
      requestBody
    );
  }

  //-----------------------------------------------------------------------------------------------------------------------------
}
