import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  showPassword = false; // Define showPassword property
  showPasswordConfirm = false; // Define showPasswordConfirm property

  passwordVisible = false;
  confirmPasswordVisible = false;
  [x: string]: any;
  form!: FormGroup;
  email: string = '';
  token: string = '';
  constructor( private toastr: ToastrService,private fb: FormBuilder,private authService:AuthService,  private route: ActivatedRoute,private router:Router) {}

  ngOnInit(): void {
   // this.route.queryParams.subscribe((params) => {
   //   this.email = params['email'];
     // this.token = params['token'];
     this.route.queryParams.subscribe((params) => {
      this['resetToken'] = params['resetToken'];
     // console.log('Token retrieved:', this.token);

    this.form = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });
  });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordMismatch: true };
  }
 /* submitForm(): void {
    if (this.form.valid) {
      const newPassword = this.form.get('password')?.value;
  
      // Fetch the resetToken from the URL parameter
      const resetToken = this.route.snapshot.queryParams['resetToken'];
  
      console.log('Token before request:', resetToken);
  
      // Call the updatePasswordByEmailAndToken function with the fetched resetToken
      this.authService.updatePasswordByEmailAndToken(this.email, resetToken, newPassword)
        .subscribe(
          (response) => {
            console.log('Password updated successfully', response);
            // You can optionally redirect to a success page or show a success message.
          },
          (error) => {
            console.error('Error updating password', error);
            // Handle error here, show error message or take appropriate action.
          }
        );
    }
  }*/
  // submitForm(): void {
  //   if (this.form.valid) {
  //     const newPassword = this.form.get('password')?.value;

  //   // Fetch the resetToken from the URL parameter
  //     const resetToken = this.route.snapshot.queryParams['resetToken'];
  //     console.log('Token before request:', resetToken);
  //     this.authService
  //       .updateAdminPasswordByToken(resetToken, newPassword) 
  //       .subscribe(
  //         (response) => {
  //           console.log('Password updated successfully', response);
            
  //           // You can optionally redirect to a success page or show a success message.
  //         },
  //         (error) => {
  //           console.error('Error updating password', error);
  //           // Handle error here, show error message or take appropriate action.
  //         }
  //       );
  //   }
  // }
  submitForm(): void {
    if (this.form.valid) {
      const newPassword = this.form.get('password')?.value;
      
      // Fetch the resetToken from the URL parameter
      const resetToken = this.route.snapshot.queryParams['resetToken'];
      console.log('Token before request:', resetToken);
  
   
  
    
        this.authService.updateAdminPasswordByToken(resetToken, newPassword)
          .subscribe(
            (response) => {
              console.log('Admin password updated successfully', response);
              this.toastr.success( 'Password Has Been Reset', 'Try Signing In',{
                // toastClass: 'toast-custom',
                closeButton: true, // Show a close button on the toast
                // progressBar: true, // Show a progress bar
                positionClass: 'toast-top-center', // Customize the position for this message
                timeOut: 2000, // Toast message will automatically disappear after 3 seconds
               
              });
              // You can optionally redirect to a success page or show a success message.
            },
            (error) => {
              console.error('Error updating admin password', error);
              this.toastr.warning('Failed To Reset Password', 'Try Again Later', {
                closeButton: true,
                positionClass: 'toast-top-center',
                timeOut: 3000,
              });
              // Handle error here, show error message or take appropriate action.
            }
          );
      } 
    }
  
  
  // Inside your component class
togglePasswordVisibility() {
  this.showPassword = !this.showPassword;
}

togglePasswordConfirmVisibility() {
  this.showPasswordConfirm = !this.showPasswordConfirm;
}

closeForm() {
  this.router.navigate(['/']);
}
}
