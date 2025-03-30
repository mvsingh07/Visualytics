import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ThemeService } from 'src/app/theme.service';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
interface Task {
  _id: string;
  description: string;
  done: boolean;
  userEmail: String;
}

@Component({
  selector: 'app-main-profile',
  templateUrl: './main-profile.component.html',
  styleUrls: ['./main-profile.component.scss'],
  // encapsulation: ViewEncapsulation.None // Set encapsulation to None
  encapsulation: ViewEncapsulation.ShadowDom,
})
export class MainProfileComponent implements OnInit {
  ishideTask!: boolean;
  private themeSubscription: Subscription = new Subscription();

  loggedInUserName: string | undefined;
  loggedInUserEmail!: string;
  loggedInUserType: string | undefined;
  tasks: Task[] = [];
  pendingTasks: Task[] = [];
  loggedInUserTasksVisibility!: boolean;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private userService: UsersService,
    private http: HttpClient,
    private toastr: ToastrService,
    private fb: FormBuilder,
    public themeService: ThemeService
  ) {
    this.userService.fetchLoggedInUserInfo().subscribe(
      (userInfo: any) => {
        this.loggedInUserTasksVisibility = userInfo?.hideTask;

        if (this.loggedInUserTasksVisibility == true) {
          this.ishideTask = false;
          console.log('tasks hidden');
        } else if (this.loggedInUserTasksVisibility == false) {
          this.ishideTask = true;
        } else {
          console.log('value undefined');
        }

        // Move your logic inside the subscribe blo
      },
      (error) => {
        console.error('Error fetching user information:', error);
      }
    );
  }

  ngOnInit(): void {
    this.fetchUserInfo();
    this.fetchTasks();
    // this.loadExternalCSS('//maxcdn.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css');

    // this.themeSubscription=this.themeService.ishideTask$.subscribe((ishideTask)=>{
    //   this.ishideTask=ishideTask;
    // })

    // this.toggleVisibility();

    // console.log("vale in main profile", this.ishideTask)
  }
  loadExternalCSS(url: string) {
    const link = this.document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    this.document.head.appendChild(link);
  }
  showTasks: boolean = true;

  // toggleVisibility(){

  // }

  fetchTasks() {
    const token = sessionStorage.getItem('token'); // Retrieve the JWT token from local storage
    // console.log("token in userservice namefunction:",token);

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`); // Set the Authorization header
      // console.log("Token in headers",headers);

      this.http
        .get<Task[]>('http://192.168.1.131:8021/api/tasks', { headers })
        .subscribe(
          (tasks) => {
            tasks.reverse();

            this.tasks = tasks.filter((task) => task.done);
            this.pendingTasks = tasks.filter((task) => !task.done);

            // Display only the first three tasks
            this.tasks = this.tasks.slice(0, 3);
          },
          (error) => {
            console.error('Error fetching tasks:', error);
          }
        );
    }
  }

  fetchUserInfo() {
    this.userService.fetchLoggedInUserInfo().subscribe(
      (userInfo: any) => {
        this.loggedInUserName = userInfo?.name;
        this.loggedInUserEmail = userInfo?.email;
        this.loggedInUserType = userInfo?.userType;
      },
      (error) => {
        console.error('Error fetching user information:', error);
      }
    );
  }
}
