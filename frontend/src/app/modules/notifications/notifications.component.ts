import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { NotificationService } from 'src/app/services/notification.service';
import { MatPaginator } from '@angular/material/paginator';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsersService } from 'src/app/services/users.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

interface Operation {
  _id: string;
  description: string;
  status: boolean;
  userEmail: String;
}
@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  badgeCount = 1;
  operations: Operation[] = [];

  loggedInUser: string | undefined;
  pageSizeOptions: number[] = [12];
  dataSource = new MatTableDataSource<Operation>();
  data: any[] = []; //
  displayedColumns: string[] = ['description', 'timestamp'];
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;

  constructor(
    private notificationService: NotificationService,
    private http: HttpClient,
    private userService: UsersService
  ) {
    this.adjustPageSizeOptions(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.adjustPageSizeOptions(window.innerHeight);
  }

  // Function to adjust pageSizeOptions based on screen width
  private adjustPageSizeOptions(screenHeight: number): void {
    // Define the base page size option
    let basePageSize = 12;

    // Calculate additional pageSizeOptions based on screen height
    const additionalOptions = Math.floor((screenHeight - 650) / 100);

    // Ensure the basePageSize is not less than 14
    basePageSize = Math.max(basePageSize, 12);

    // Set the pageSizeOptions dynamically
    this.pageSizeOptions = [basePageSize + additionalOptions];
  }

  ngOnInit(): void {
    // Subscribe to notification events
    this.notificationService.notification$.subscribe((count) => {
      this.badgeCount += count; // Update badge count
    });

    this.userService.fetchLoggedInUserInfo().subscribe(
      (userInfo: any) => {
        this.loggedInUser = userInfo?.email;
        // console.log("The user signed in:",this.loggedInUser);
      },
      (error) => {
        console.error('Error fetching user information:', error);
      }
    );

    this.userService.fetchLoggedInUserInfo().subscribe(
      (userInfo: any) => {
        this.loggedInUser = userInfo?.email;
        // console.log("The user signed in:",this.loggedInUser);
      },
      (error) => {
        console.error('Error fetching user information:', error);
      }
    );
    this.fetchOperations();
  }

  fetchOperations() {
    const token = sessionStorage.getItem('token'); // Retrieve the JWT token from local storage
    // console.log("token in userservice namefunction:",token);
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`); // Set the Authorization header
      // console.log("Token in headers",headers);

      this.http
        .get<Operation[]>('http://192.168.1.131:8021/api/userOperations', {
          headers,
        })
        .subscribe(
          (operations) => {
            this.dataSource.data = operations;
            this.dataSource.paginator = this.paginator;
          },
          (error) => {
            console.error('Error fetching operations:', error);
          }
        );
    }
  }
}
