import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UsersService } from 'src/app/services/users.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { AdminService } from 'src/app/services/admin.service';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const matchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const newPassword = control.get('newPassword')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;
  return newPassword === confirmPassword ? null : { mustMatch: true };
};

interface Task {
  _id: string;
  description: string;
  done: boolean;
  userEmail: String;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  newTask: string = '';
  loggedInUser: string | undefined;
  tasks: Task[] = [];
  changePasswordForm!: FormGroup;
  oldPassword!: string;
  newPassword!: string;
  loggedInUserName: string | undefined;
  loggedInUserEmail: string | undefined;
  loggedInUserType: string | undefined;
  newName: string = ''; // Input for the new name
  constructor(
    private toastr: ToastrService,
    private fb: FormBuilder,
    private userService: UsersService,
    private http: HttpClient,
    private authService: AuthService,
    private adminService: AdminService
  ) {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
          ),
        ],
      ],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit() {
    this.fetchUserInfo();
    this.fetchTasks();

    this.changePasswordForm = this.fb.group(
      {
        oldPassword: ['', Validators.required],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      {
        validator: matchValidator, // Add the matchValidator here
      }
    );
  }

  newValue: boolean = false;

  // toggleValue(){

  //    this.newValue=!this.newValue;
  //   //  if (!this.newValue) {
  //   //   this.toastr.warning('Please enter a new name.');
  //   //   return;
  //   // }

  //   this.userService.updateUserName(this.newValue).subscribe(
  //     (updatedUserInfo: any) => {
  //       this.toastr.success('Name updated successfully!');
  //       // Update the component with the new user information
  //       this.loggedInUserName = updatedUserInfo.name;
  //       // Clear the input field
  //       // this.newValue = '';
  //     },
  //     (error) => {
  //       console.error('Error updating user name:', error);
  //       this.toastr.error('Error updating name. Please try again.');
  //     }
  //   );

  // }

  changePassword() {
    if (this.changePasswordForm!.invalid) {
      this.toastr.warning('Please fill in both old and new passwords.');
      return;
    }

    const { oldPassword, newPassword } = this.changePasswordForm!.value;
    this.userService.updatePassword(oldPassword, newPassword).subscribe(
      () => {
        this.toastr.success('Password updated successfully!');
        this.changePasswordForm!.reset();
      },
      (error) => {
        console.error('Error updating password:', error);
        this.toastr.error('Error updating password. Please try again.');
      }
    );
  }

  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

  togglePassword(type: 'old' | 'new' | 'confirm') {
    if (type === 'old') {
      this.showOldPassword = !this.showOldPassword;
    } else if (type === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else if (type === 'confirm') {
      // Add this condition for the confirm password
      this.showConfirmPassword = !this.showConfirmPassword;
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

  updateUserName() {
    if (!this.newName) {
      this.toastr.warning('Please enter a new name.');
      return;
    }

    this.userService.updateUserName(this.newName).subscribe(
      (updatedUserInfo: any) => {
        this.toastr.success('Name updated successfully!');
        // Update the component with the new user information
        this.loggedInUserName = updatedUserInfo.name;
        // Clear the input field
        this.newName = '';
      },
      (error) => {
        console.error('Error updating user name:', error);
        this.toastr.error('Error updating name. Please try again.');
      }
    );
  }

  fetchTasks() {
    const token = sessionStorage.getItem('token'); // Retrieve the JWT token from local storage
    // console.log("token in userservice namefunction:", token);

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `bearer ${token}`); // Set the Authorization header
      // console.log("Token in headers", headers);

      this.http
        .get<Task[]>('http://192.168.1.131:8021/api/tasks', { headers })
        .subscribe(
          (tasks) => {
            tasks.reverse();

            this.tasks = tasks.filter((task) => task.done);

            // Display only the first three tasks
            this.tasks = this.tasks.slice(0, 3);
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
