import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from 'src/app/services/users.service';
import { Observable } from 'rxjs';
import { ThemeService } from 'src/app/theme.service';
import { NotificationService } from 'src/app/services/notification.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();
  loggedInUserName: string | undefined;
  loggedInUserDarkMode!: boolean;

  private baseUrl = 'http://192.168.1.131:8021';

  badgeCount = 0;

  enableDarkMode!: boolean;
  rotating = false;

  constructor(
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private userService: UsersService,
    private themeService: ThemeService,
    private notificationService: NotificationService,
    private http: HttpClient
  ) {
    this.userService.fetchLoggedInUserInfo().subscribe(
      (userInfo: any) => {
        this.loggedInUserDarkMode = userInfo?.isDarkMode;
        this.loggedInUserName = userInfo?.name;
        // console.log("Value of Dark Mode:", this.loggedInUserDarkMode);

        // Move your logic inside the subscribe block
        if (this.loggedInUserDarkMode == false) {
          this.enableDarkMode = false;
        } else if (this.loggedInUserDarkMode == true) {
          this.enableDarkMode = true;
        }
      },
      (error) => {
        console.error('Error fetching user information:', error);
      }
    );
  }
  rotateGear() {
    this.rotating = true;
    setTimeout(() => {
      this.rotating = false; // Remove class after animation completes
    }, 300); // Match animation duration (0.5s)
  }
  notificationCount: number | null = null;

  ngOnInit() {
    this.fetchNotificationCount();
  }

  fetchNotificationCount(): void {
    console.log('called');
    this.notificationService.getNotificationCount().subscribe(
      (data) => {
        this.badgeCount = data.notificationCount;
        console.log('bagde count:', this.badgeCount);
      },
      (error) => {
        console.error('Error fetching notification count:', error);
      }
    );
  }

  // Method to handle when the notification badge icon is clicked
  onNotificationClicked() {
    // Reset the notification count to 0
    this.badgeCount = 0;
  }

  // values: any[] = [];

  // Function to update a value in the database
  updateValue(valueId: number, newValue: any): Observable<any> {
    const url = `${this.baseUrl}/updateValue/${valueId}`;
    return this.http.put<any>(url, newValue).pipe();
  }

  toggleSideBar() {
    this.toggleSideBarForMe.emit();
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  }

  login() {
    this.router.navigate(['user-login']);
  }

  logout() {
    this.authService.logout(); // Call the logout() method from the AuthService
    this.router.navigate(['']);
    this.toastr.success('Login to gain access', 'Signed Out', {
      // toastClass: 'toast-custom',
      closeButton: true, // Show a close button on the toast
      // progressBar: true, // Show a progress bar
      positionClass: 'toast-top-center', // Customize the position for this message
      timeOut: 2000, // Toast message will automatically disappear after 3 seconds
    });
  }
}
