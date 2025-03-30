import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';

import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-email-provider',
  templateUrl: './email-provider.component.html',
  styleUrls: ['./email-provider.component.scss']
})
export class EmailProviderComponent implements OnInit {
  emailForm: FormGroup; // Declare emailForm as a FormGroup

  constructor(private formBuilder: FormBuilder, private authService: AuthService,private toastr: ToastrService) {
    // Initialize the emailForm property in the constructor
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]] // You can add more validators if needed
    });
  }

  ngOnInit() {
    // You can keep the ngOnInit() method as it is
  }

onSubmit() {
    if (this.emailForm.valid) {
      const email = this.emailForm.value.email;
      this.authService.adminForgotPassword(email).subscribe(
        (response: any) => {
          console.log(response);
          if (response && response.message) {
            // Display a success message or notify the user that the reset link has been sent
            // For example, you can set a flag to show a success message in the template
            // this.showResetLinkSentMessage = true;
            this.toastr.success('Password Reset Link has been sent to your email', 'Success', {
              // toastClass: 'toast-custom',
              closeButton: true, // Show a close button on the toast
              progressBar: true, // Show a progress bar
              positionClass: 'toast-top-center', // Customize the position for this message
              timeOut: 3000, // Toast message will automatically disappear after 3 seconds
             
            });
           
          } 
        },
        (error: any) => {
          console.error(error);
          this.toastr.error('Failed to send the password reset link. Please try again later.', 'Error', {
            closeButton: true,
            progressBar: true,
            positionClass: 'toast-top-center',
            timeOut:2000
          });
        }
      );
    }
    else{
      this.toastr.error('Invalid Email ID', 'Error', {
        closeButton: true,
        progressBar: true,
        positionClass: 'toast-top-center',
        timeOut:2000
      });
    }
}



}
