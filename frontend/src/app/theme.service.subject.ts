import { Injectable, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UsersService } from './services/users.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root',
})
export class ThemeService implements OnInit {
  loggedInUserDarkMode!: boolean;
  private apiUrl = 'http://192.168.1.131:8021';
  // BehaviorSubject with an initial value of false
  private isDarkModeSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  // Observable to expose the isDarkModeSubject
  public isDarkMode$: Observable<boolean> =
    this.isDarkModeSubject.asObservable();

  constructor(
    private toastr: ToastrService,
    private http: HttpClient,
    private userService: UsersService
  ) {
    // Fetch and update the dark mode value when the service is instantiated
    this.loadDarkModeFromDatabase().subscribe(
      (isDarkMode: boolean) => {
        this.isDarkModeSubject.next(isDarkMode);
      },
      (error) => {
        console.error('Error loading dark mode value from the database', error);
      }
    );
  }

  loadDarkModeFromDatabase(): Observable<any> {
    const token = sessionStorage.getItem('token');
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`); // Set the Authorization header
      console.log('Token in headers', headers);
      return this.http.get(`${this.apiUrl}/api/user`, { headers });
    } else {
      // Handle the case where token is not available
      return of(null);
    }
  }

  ngOnInit(): void {
    this.fetchUserInfo();
  }

  newValue: boolean = false;

  fetchUserInfo() {
    this.userService.fetchLoggedInUserInfo().subscribe(
      (userInfo: any) => {
        this.loggedInUserDarkMode = userInfo?.isDarkMode;
      },
      (error) => {
        console.error('Error fetching user information:', error);
      }
    );
  }

  toggleDarkMode() {
    // Toggle the value
    this.newValue = !this.loggedInUserDarkMode;

    // Update the BehaviorSubject
    // this.isDarkModeSubject.next(this.newValue);

    console.log('value being gpassed');

    this.userService.updateDarkMode(this.newValue).subscribe(
      (updatedUserInfo: any) => {
        this.toastr.success('Name updated successfully!');
        // Update the component with the new user information
        this.loggedInUserDarkMode = updatedUserInfo.isDarkMode;
        // Clear the input field
        // this.newValue = '';
      },
      (error) => {
        console.error('Error updating user name:', error);
        this.toastr.error('Error updating name. Please try again.');
      }
    );
  }

  // saveDarkModeToDatabase(isDarkMode: boolean): Observable<any>{
  //   const token= sessionStorage.getItem('token');

  //   if(token){
  //     const headers = new HttpHeaders().set('Authorization',`bearer${token}`);
  //     console.log('Dark mode value saved to the database:',token , isDarkMode);
  //     return this.http.put(`${this.apiUrl}/api/updateSettings`,{isDarkMode},{headers});

  //   }
  //   else{
  //     return of(null);
  //   }
  // }

  private expandSidebarOnHoverSubject = new BehaviorSubject<boolean>(false);
  expandSidebarOnHover$ = this.expandSidebarOnHoverSubject.asObservable();

  setExpandSidebarOnHover(value: boolean): void {
    this.expandSidebarOnHoverSubject.next(value);
    console.log('Value passed:', this.expandSidebarOnHoverSubject);
  }

  private ishideTasksubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);

  public ishideTask$ = this.ishideTasksubject.asObservable();

  updateTaskVisibility() {
    this.ishideTasksubject.next(!this.ishideTasksubject.value);
    console.log('value of hide task', this.ishideTask$);
  }
}
