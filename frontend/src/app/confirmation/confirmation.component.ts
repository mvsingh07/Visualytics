import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  templateUrl: './confirmation.component.html',
  styleUrls: ['./confirmation.component.scss'],
})
export class ConfirmationComponent implements OnInit {
  token: string | null = null;
  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      console.log('Query Parameters:', params);
      const verificationToken = params['verificationToken'];

      console.log('Token in confirmation mail from user:', verificationToken);

      // Define the URL of your email verification service (replace with the actual URL).
      const verificationServiceUrl = `http://192.168.1.131:8021/verify/${verificationToken}`;

      // Define the data to send, which includes the verification token.
      const data = { token: verificationToken };

      // Make an HTTP POST request to the email verification service.
      this.http.post(verificationServiceUrl, data).subscribe(
        (response) => {
          // Handle a successful response here, such as displaying a success message.
          console.log('Verification successful', response);

          // Redirect the user to the login page after a delay
          setTimeout(() => {
            window.location.assign('http://192.168.1.131:8021/user-login'); // Replace with the actual URL of your login page
          }, 10000); // 10000 milliseconds = 10 seconds
        },
        (error) => {
          // Handle errors here, such as displaying an error message.
          console.error('Verification failed', error);
        }
      );
    });
  }
}
