import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from '../services/users.service';
import { AdminService } from '../services/admin.service';
import { interval } from 'rxjs';

import jwt_decode from 'jwt-decode';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss'],
})
export class UserLoginComponent implements OnInit, OnDestroy {
  form: FormGroup;
  passwordVisible: boolean = false;

  formdata = {
    email: '',
    password: '',
    usertype: '',
  };

  loggedInUserName: string | undefined;
  loggedInAdminName: string | undefined;

  private tokenExpirationTimer: any;

  constructor(
    private toastr: ToastrService,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute, // Added for handling query parameters
    private userService: UsersService,
    private adminService: AdminService
  ) {
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, this.emailFormatValidator]],
      password: ['', Validators.required],
      usertype: ['user'],
    });

    // Check for sessionExpired query parameter
    this.route.queryParams.subscribe((params) => {
      if (params['sessionExpired']) {
        this.toastr.warning(
          'Your session has expired. Please log in again.',
          'Session Expired',
          {
            closeButton: true,
            positionClass: 'toast-top-center',
            timeOut: 3000,
          }
        );
      }
    });
  }
  ngOnInit(): void {
    this.checkTokenExpiration();

    interval(1800000).subscribe(() => {
      this.checkTokenExpiration();
    });
  }
  // If the form is invalid, return and do not proceed with the login action

  private checkTokenExpiration() {
    // console.log('ngOnInit called');
    // console.log('Checking token expiration...');
    const token = sessionStorage.getItem('token');
    if (token) {
      const tokenData = jwt_decode(token) as { exp: number }; // Use a type assertion
      const currentTime = Math.floor(Date.now() / 1000);

      if (tokenData.exp - currentTime < 1800) {
        // Token has expired, redirect to login with sessionExpired message
        this.authService.logout();
        this.router.navigate(['/login'], {
          queryParams: { sessionExpired: true },
        });
      } else {
        // Calculate the time remaining until token expiration
        const expiresIn = tokenData.exp - currentTime;
        this.tokenExpirationTimer = setTimeout(() => {
          this.checkTokenExpiration();
        }, expiresIn * 1000);
      }
    }
  }

  ngOnDestroy(): void {
    // Clear the token expiration timer when the component is destroyed
    clearTimeout(this.tokenExpirationTimer);
  }

  login(formdata: any) {
    // console.log('Form Data:', formdata);
    if (this.form.invalid) {
      return;
    }

    this.authService.login(formdata.email, formdata.password).subscribe(
      (response) => {
        // console.log('Login Response:', response);
        if (response && response.token) {
          // Login successful, save the token and navigate based on user type
          // this.authService.setToken(response.token,response.userType);
          // console.log('Token:', response.token);
          const userType = formdata.usertype; // Get the selected user type from the form
          // console.log('User Type:', userType);
          // console.log('Response User Type:', response.userType);

          if (response.userType === 'user') {
            this.userService.fetchLoggedInUserInfo().subscribe(
              (userInfo: any) => {
                // Update the loggedInUserName with the user's name
                this.loggedInUserName = userInfo?.name;
                // console.log("fetching user name");
                // console.log(this.loggedInUserName);
              },
              (error: any) => {
                console.error('Error fetching user information:', error);
              }
            );
          } else if (response.userType === 'admin') {
            this.adminService.fetchLoggedInAdminInfo().subscribe(
              (adminInfo: any) => {
                // Update the loggedInAdminName with the admin's name
                this.loggedInAdminName = adminInfo?.name;
                // console.log("fetching admin name");
                // console.log(this.loggedInAdminName);
              },
              (error: any) => {
                console.error('Error fetching admin information:', error);
              }
            );
          }

          if (response.userType === 'admin') {
            this.router.navigate(['/admin/admindd']); // Navigate to the admin dashboard
            this.toastr.success(
              'Welcome to Dashboard',
              'Signed In Successfully',
              {
                // toastClass: 'toast-custom',
                closeButton: true, // Show a close button on the toast
                // progressBar: true, // Show a progress bar
                positionClass: 'toast-top-center', // Customize the position for this message
                timeOut: 2000, // Toast message will automatically disappear after 3 seconds
              }
            );
          } else if (response.userType === 'user') {
            this.router.navigate(['/user/dd']); // Navigate to the user dashboard
            this.toastr.success(
              'Welcome to Dashboard',
              'Signed In Successfully',
              {
                // toastClass: 'toast-custom',
                closeButton: true, // Show a close button on the toast
                // progressBar: true, // Show a progress bar
                positionClass: 'toast-top-center', // Customize the position for this message
                timeOut: 2000, // Toast message will automatically disappear after 3 seconds
              }
            );
          } else {
            // User type mismatch, show an error message
            this.form.get('usertype')?.setErrors({ userTypeMismatch: true });
            this.toastr.error('User Type Not matched', 'Error', {
              // toastClass: 'toast-custom',
              closeButton: true, // Show a close button on the toast
              // progressBar: true, // Show a progress bar
              positionClass: 'toast-top-center', // Customize the position for this message
              timeOut: 2000, // Toast message will automatically disappear after 3 seconds
            });
          }
        } else {
          // Login failed, show an error message for invalid password
          this.form.get('password')?.setErrors({ invalidPassword: true });
          this.toastr.error('Incorrect Password', 'Error', {
            // toastClass: 'toast-custom',
            closeButton: true, // Show a close button on the toast
            // progressBar: true, // Show a progress bar
            positionClass: 'toast-top-center', // Customize the position for this message
            timeOut: 2000, // Toast message will automatically disappear after 3 seconds
          });
        }
      },
      (error) => {
        // Handle login error, show an error message or redirect to a login page with an error message
        console.error('Login failed due to server error:', error);
        this.toastr.error('User Does Not Exist', 'Failed To Sign In', {
          // toastClass: 'toast-custom',
          closeButton: true, // Show a close button on the toast
          // progressBar: true, // Show a progress bar
          positionClass: 'toast-top-center', // Customize the position for this message
          timeOut: 2000, // Toast message will automatically disappear after 3 seconds
        });
      }
    );
  }

  // Use the Angular Router to navigate to the "sign-up" route
  signup() {
    this.router.navigate(['sign-up']);
  }
  //validation of email
  emailFormatValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const email: string = control.value;

    // Check if the email contains "@" and "."
    if (email && (!email.includes('@') || !email.includes('.'))) {
      return { invalidFormat: true };
    }

    // Check if there are characters after "@" and "."
    const atIndex = email.indexOf('@');
    const dotIndex = email.lastIndexOf('.');
    if (atIndex >= 0 && dotIndex >= 0 && dotIndex - atIndex <= 1) {
      return { invalidFormat: true };
    }

    // Check if there are characters after the last dot
    const charactersAfterDot = email.substring(dotIndex + 1);
    if (charactersAfterDot.length === 0) {
      return { invalidFormat: true };
    }

    return null;
  }
  // ensures password visibility with eye icon
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
    const passwordInput = document.getElementById(
      'password'
    ) as HTMLInputElement;
    passwordInput.type = this.passwordVisible ? 'text' : 'password';
  }
}
