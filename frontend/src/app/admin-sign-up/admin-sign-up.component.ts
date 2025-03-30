import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';

import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-admin-sign-up',
  templateUrl: './admin-sign-up.component.html',
  styleUrls: ['./admin-sign-up.component.scss']
})
export class AdminSignUpComponent implements OnInit{
  
  form: FormGroup;
  showPassword: boolean = false;
  showRepeatPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,private toastr: ToastrService
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, this.emailFormatValidator]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]],
      pwd: ['', Validators.required]
    });
  }

 
  ngOnInit(): void {
    
  }
  
  goto() {
    this.router.navigate(['user-login']);
  }

  closeForm() {
    this.router.navigate(['/admindd']);
  }


  toggleRepeatPasswordVisibility() {
    this.showRepeatPassword = !this.showRepeatPassword;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  registerAdmin() {
    const Admin = {
      name: this.form.get('name')?.value || '',
      email: this.form.get('email')?.value || '',
      password: this.form.get('password')?.value || '',
      userType: 'admin',
    };
    this.authService.registerAdmin(Admin).subscribe(
      (response) => {
        this.toastr.success('Registration Successful', 'Try Signing In', {
         
          closeButton: true, // Show a close button on the toast
          positionClass: 'toast-top-center', // Customize the position for this message
          timeOut: 2000, // Toast message will automatically disappear after 3 seconds
         
        });
        console.log('User registration response:', response);
      },
      (error) => {
        this.toastr.error('Registration Failed', 'Try Again', {
         
          closeButton: true, // Show a close button on the toast
          positionClass: 'toast-top-center', // Customize the position for this message
          timeOut: 2000, // Toast message will automatically disappear after 3 seconds
        });
        console.error('Registration error:', error);
      }
    );
  }
  emailFormatValidator(control: AbstractControl): { [key: string]: any } | null {
    const email: string = control.value;
  
    if (email && (!email.includes('@') || !email.includes('.'))) {
      return { invalidFormat: true };
    }
  
    const atIndex = email.indexOf('@');
    const dotIndex = email.lastIndexOf('.');
    if (atIndex >= 0 && dotIndex >= 0 && dotIndex - atIndex <= 1) {
      return { invalidFormat: true };
    }
  
    const charactersAfterDot = email.substring(dotIndex + 1);
    if (charactersAfterDot.length === 0) {
      return { invalidFormat: true };
    }
  
    return null;
  }
  
  
}