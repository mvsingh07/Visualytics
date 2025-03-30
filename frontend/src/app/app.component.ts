import { Component } from '@angular/core';
import { DarkModeService } from './services/dark-mode.service';
import { AuthService } from './services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { PythonExecutorService } from './services/python-executor.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'dashboard';

  constructor(
    private http: HttpClient,
    public darkModeService: DarkModeService,
    private authService: AuthService,
    private toastr: ToastrService,
    private pythonExecutorService: PythonExecutorService
  ) {}

  toggleDarkMode() {
    this.darkModeService.toggleDarkMode();
  }

  ngOnInit() {
    this.authService.init();

    // this.initAutomationTransformation();

    this.setupTokenRefresh();

    this.setupInactivityDetection();

    // this.runPythonScripts()
    // Call the API periodically
    // setInterval(() => {
    //   this.initAutomationTransformation();
    // }, 30000); // Call the API every 1 minute (adjust as needed)
    //
  }
  runPythonScripts(): void {
    this.pythonExecutorService.runScripts().subscribe(
      (response) => {
        console.log('Scripts executed successfully:', response);
      },
      (error) => {
        console.error('Error executing scripts:', error);
      }
    );
  }

  initAutomationTransformation() {
    console.log('FTS Automation Initiated');

    // Check if the selectedInputFolderPath exists, if not, create it
    this.http
      .post('http://192.168.1.131:8021/ftsAutomation', {})
      .subscribe((data: any) => {
        console.log('Response from server:', data);
      });
  }

  private inactivityTimeout: any;
  private readonly INACTIVITY_PERIOD = 15 * 60 * 1000; // 15 minutes in milliseconds

  ngOnDestroy(): void {
    // Clear any existing inactivity timeout when component is destroyed
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
  }

  private setupTokenRefresh(): void {
    // Check if a token exists in session storage
    const token = sessionStorage.getItem('token');
    const userType = sessionStorage.getItem('userType');
    const expirationTimestamp = sessionStorage.getItem('tokenExpiration');
    // console.log("Auth Service NgOnInit----------------> ")

    if (token && userType && expirationTimestamp) {
      // Calculate expiresIn based on current time
      //  console.log("Auth Service NgOnInit----------------> ")
      const expiresIn = 600;
      const refreshTime = expiresIn * 0.8 * 1000;

      // Call setupTokenRefresh to refresh the token
      this.authService.setupTokenRefresh(refreshTime);
    }
  }

  private setupInactivityDetection(): void {
    // Reset inactivity timer on user activity
    console.log('Session Inactivity detection enabled');
    const resetTimer = () => {
      if (this.inactivityTimeout) {
        clearTimeout(this.inactivityTimeout);
      }
      this.inactivityTimeout = setTimeout(() => {
        // Log out user or perform any other action on inactivity
        this.authService.logout();
        console.log('Session expired because of inactivity');
        this.toastr.error(
          'Session Expired because of Inactivity',
          'Log In Again',
          {
            // toastClass: 'toast-custom',
            closeButton: true, // Show a close button on the toast
            // progressBar: true, // Show a progress bar
            positionClass: 'toast-top-center', // Customize the position for this message
            // Toast message will automatically disappear after 3 seconds
          }
        );
        // Optionally, navigate to a different route after logout
        // this.router.navigate(['/login']);
      }, this.INACTIVITY_PERIOD);
    };

    // Reset timer on user activity events
    ['click', 'mousemove', 'keypress'].forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Initial setup of the inactivity timer
    resetTimer();
  }
}
