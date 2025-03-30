import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { UsersService } from 'src/app/services/users.service';
interface Task {
  _id: string;
  description: string;
  done: boolean;
  userEmail: String;
}

@Component({
  selector: 'app-mytasks',
  templateUrl: './mytasks.component.html',
  styleUrls: ['./mytasks.component.scss'],
})
export class MytasksComponent {
  newTask: string = '';
  tasks: Task[] = [];
  loggedInUser: string | undefined;
  constructor(private http: HttpClient, private userService: UsersService) {}

  ngOnInit() {
    this.userService.fetchLoggedInUserInfo().subscribe(
      (userInfo: any) => {
        this.loggedInUser = userInfo?.email;
        // console.log("The user signed in:",this.loggedInUser);
      },
      (error) => {
        console.error('Error fetching user information:', error);
      }
    );
    this.fetchTasks();
  }

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
            this.tasks = tasks;
          },
          (error) => {
            console.error('Error fetching tasks:', error);
          }
        );
    }
  }

  addTask() {
    if (this.newTask.trim() !== '') {
      const task = {
        description: this.newTask,
        done: false,
        userEmail: this.loggedInUser,
      };

      this.http
        .post<Task>('http://192.168.1.131:8021/api/tasks', task)
        .subscribe(
          (newTask) => {
            this.tasks.push(newTask);
            this.newTask = ''; // Clear the input field after adding task
          },
          (error) => {
            console.error('Error adding task:', error);
          }
        );
    }
  }

  taskDone = false;

  markAsDone(task: Task) {
    this.http
      .put<Task>(`http://192.168.1.131:8021/api/tasks/${task._id}`, {})
      .subscribe(
        (updatedTask) => {
          task.done = updatedTask.done;
        },
        (error) => {
          console.error('Error marking task as done:', error);
        }
      );
  }

  deleteTask(task: Task) {
    this.http
      .delete<Task>(`http://192.168.1.131:8021/api/tasks/${task._id}`)
      .subscribe(
        (deletedTask) => {
          const index = this.tasks.indexOf(task);
          if (index !== -1) {
            this.tasks.splice(index, 1);
          }
        },
        (error) => {
          console.error('Error deleting task:', error);
        }
      );
  }
}
