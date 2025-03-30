import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {
  form: FormGroup;
  showPassword: boolean = false;
  showRepeatPassword: boolean = false;
  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router,private toastr: ToastrService) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, this.emailFormatValidator]],
      //Password validation through Regex
      password: ['', [Validators.required,  Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]],
      pwd: ['', Validators.required]
    });
  }

  ngOnInit() {
  }

  //Angular Router to navigate to "login" route
  goto() {
    this.router.navigate(['user-login'])
  }

  // If the form is invalid, return and do not proceed with the signup action
  validateForm() {
    if (this.form.invalid) {
      return;
    }

    const password = this.form.get('password')?.value;
    const confirmPassword = this.form.get('pwd')?.value;
    if (password !== confirmPassword) {
      this.toastr.error('Password not matched', 'Check Again', {
                // toastClass: 'toast-custom',
                closeButton: true, // Show a close button on the toast
                // progressBar: true, // Show a progress bar
                positionClass: 'toast-top-center', // Customize the position for this message
                timeOut: 2000, // Toast message will automatically disappear after 3 seconds
               
              });
      return;
    }

    const user = {
      name: this.form.get('name')?.value, 
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
      userType: 'user',
    };

    this.authService.registerUser(user).subscribe(
      (response) => {
        this.toastr.success('Registration Successful', 'Try Signing In', {
                    // toastClass: 'toast-custom',
                    closeButton: true, // Show a close button on the toast
                    // progressBar: true, // Show a progress bar
                    positionClass: 'toast-top-center', // Customize the position for this message
                    timeOut: 2000, // Toast message will automatically disappear after 3 seconds
                   
                  });
      // this.showSuccess('User registration successful!');
        console.log('User registration response:', response);
      },
      (error) => {
             this.toastr.error('Registration Failed', 'Try Again', {
          // toastClass: 'toast-custom',
          closeButton: true, // Show a close button on the toast
          // progressBar: true, // Show a progress bar
          positionClass: 'toast-top-center', // Customize the position for this message
          timeOut: 2000, // Toast message will automatically disappear after 3 seconds
         
        });
        console.error('Registration error:', error);
      }
    );
  }

  closeForm() {
    this.router.navigate(['/admin/admindd']);
  }

// email validation of Form
  emailFormatValidator(control: AbstractControl): { [key: string]: boolean } | null {
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
  toggleRepeatPasswordVisibility() {
    this.showRepeatPassword = !this.showRepeatPassword;
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
 
}

