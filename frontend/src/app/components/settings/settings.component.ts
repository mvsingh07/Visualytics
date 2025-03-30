import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { matchValidator } from 'src/app/modules/profile/profile.component';
import { UsersService } from 'src/app/services/users.service';
import { ThemeService } from 'src/app/theme.service';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  changePasswordForm!: FormGroup;
  oldPassword!: string;
  newPassword!: string;
  loggedInUserDarkMode!: boolean;
  loggedInUserSidebarExpansion!: boolean;
  loggedInUserTasksVisibility!: boolean;
  loggedInUserInputFolder!: string;
  loggedInUserOutputFolder!: string;
  loggedInUserFilesize!: string;
  loggedInUserTimeout!: string;
  inputFolderName!: string;
  outputFolderName!: string;
  selectedFolder: File | null = null;
  selectedInputDirectory: string | undefined;
  selectedOutputDirectory: string | undefined;

  selectedTimeoutUnit: string | undefined;
  timeout: string | undefined;
  selectedFilesizeUnit!: string;
  filesize!: string;

  private apiUrl = '192.168.1.131:8021';

  constructor(
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private fb: FormBuilder,
    private userService: UsersService,
    private http: HttpClient
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
    this.fetchInfo();
    // Check if the sidebar expansion has been updated and display the notification message
    if (localStorage.getItem('sidebarExpansionUpdated') === 'true') {
      this.toastr.success('Changes saved');
      localStorage.removeItem('sidebarExpansionUpdated'); // Clear the flag after displaying the notification
    }
  }

  fetchInfo() {
    this.userService.fetchLoggedInUserInfo().subscribe(
      (userInfo: any) => {
        this.loggedInUserDarkMode = userInfo?.isDarkMode;
        this.loggedInUserSidebarExpansion = userInfo?.sidebarExpansion;
        this.loggedInUserTasksVisibility = userInfo?.hideTask;
        // this.loggedInUserInputFolder = userInfo.inputFolder;
        // this.loggedInUserOutputFolder = userInfo.outputFolder;
        // this.loggedInUserTimeout = userInfo.timeout;
        // this.loggedInUserFilesize = userInfo.filesize;
      },
      (error) => {
        console.error('Error fetching user information:', error);
      }
    );
  }

  saveInputFolder() {
    const inputFolder = `${this.selectedInputDirectory}/${this.inputFolderName}`;

    console.log('inputfolder name:', inputFolder);
    // Send the selected folder to backend
    this.http
      .post<any>(`http://${this.apiUrl}/api/input-folder`, { inputFolder })
      .subscribe(
        (response) => {
          console.log('Input folder saved successfully:', response);
        },
        (error) => {
          console.error('Error saving input folder:', error);
        }
      );
  }

  saveTimeout() {
    const file_transformation_timeout = `${this.timeout}`;

    console.log('Selected Timeout:', file_transformation_timeout);
    // Send the selected folder to backend
    this.http
      .post<any>(`http://${this.apiUrl}/api/changeTimeout`, {
        file_transformation_timeout,
      })
      .subscribe(
        (response) => {
          console.log('Timeout saved successfully:', response);
          this.toastr.success('Timeout updated');
        },
        (error) => {
          console.error('Error saving timeout:', error);
          this.toastr.error('Error Saving Timeout');
        }
      );
  }

  saveFilesize() {
    const multipart_file_size = `${this.filesize}`;

    console.log('Selected Filesize:', multipart_file_size);
    // Send the selected folder to backend
    this.http
      .post<any>(`http://${this.apiUrl}/api/changeFilesize`, {
        multipart_file_size,
      })
      .subscribe(
        (response) => {
          console.log('Filesize saved successfully:', response);
          this.toastr.success('Filesize updated');
        },
        (error) => {
          console.error('Error saving Filesize:', error);
          this.toastr.error(`Invalid`);
        }
      );
  }

  saveOutputFolder() {
    const outputFolder = `${this.selectedOutputDirectory}/${this.outputFolderName}`;

    console.log('inputfolder name:', outputFolder);
    // Send the selected folder to backend
    this.http
      .post<any>(`http://${this.apiUrl}/api/output-folder`, { outputFolder })
      .subscribe(
        (response) => {
          console.log('Output folder saved successfully:', response);
        },
        (error) => {
          console.error('Error saving input folder:', error);
        }
      );
  }

  toggleDarkMode() {
    console.log('Toggle Dark mode called');
    // const originalValue = this.loggedInUserDarkMode;
    this.loggedInUserDarkMode = !this.loggedInUserDarkMode;
    this.userService.updateDarkMode(this.loggedInUserDarkMode).subscribe(
      (updatedUserInfo: any) => {
        this.toastr.success('Changes Saved');
        // Update the component with the new user information
        this.loggedInUserDarkMode = updatedUserInfo.isDarkMode;
        window.location.reload();
        // console.log("value toggled toggle DarkMode", this.loggedInUserDarkMode);
      },
      (error) => {
        console.error('Error updating Settings:', error);
        this.loggedInUserDarkMode = !this.loggedInUserDarkMode;
        this.toastr.error('Error updating Settings Please try again.');
        // this.loggedInUserDarkMode = originalValue;
      }
    );
  }

  enableSidebarExpansion() {
    this.loggedInUserSidebarExpansion = !this.loggedInUserSidebarExpansion;
    this.userService
      .updateUserSettings(this.loggedInUserSidebarExpansion)
      .subscribe(
        (updatedUserInfo: any) => {
          this.loggedInUserSidebarExpansion = updatedUserInfo.sidebarExpansion;
          // Store a flag in localStorage indicating that the sidebar expansion has been updated
          localStorage.setItem('sidebarExpansionUpdated', 'true');
          window.location.reload();
          this.toastr.success('Changes saved');
          console.log('Sidebar Expansion Enabled');
        },

        (error) => {
          console.log('Error in enabling Sidebar expansion ', error);
          this.toastr.error('Error updating Settings Please try again.');
        }
      );
  }

  expandedOption: string | null = null;

  toggleOption(option: string): void {
    if (this.expandedOption === option) {
      // this.expandedOption = null;
    } else {
      this.expandedOption = option;
    }
  }

  expandSidebarOnHover = false;

  onToggleExpandSidebarOnHover(): void {
    this.expandSidebarOnHover = !this.expandSidebarOnHover;
    console.log(
      'Theme service setExpandSidebarOnHover',
      this.expandSidebarOnHover
    );
    this.themeService.setExpandSidebarOnHover(this.expandSidebarOnHover);
  }

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

  showOldPassword: boolean = false;
  showNewPassword: boolean = false;
  showConfirmPassword: boolean = false;

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

  // hideTasksInProfile() {
  //   this.themeService.updateTaskVisibility();
  // }

  hideTasksInProfile() {
    console.log('function called');
    this.loggedInUserTasksVisibility = !this.loggedInUserTasksVisibility;
    this.userService
      .updateProfileSettings(this.loggedInUserTasksVisibility)
      .subscribe(
        (updatedUserInfo: any) => {
          this.toastr.success('Changes saved');
          this.loggedInUserTasksVisibility = updatedUserInfo.hideTask;
          window.location.reload();
          console.log('Sidebar Expansion Enabled');
        },

        (error) => {
          console.log('Error in enabling Sidebar expansion ', error);
          this.toastr.error('Error updating Settings Please try again.');
        }
      );
  }

  hoverOption(option: string): void {
    this.expandedOption = option;
  }

  resetOptions(): void {
    this.expandedOption = null;
  }

  toggleTheme(): void {
    // Implement logic to change header and footer color to dark
    console.log('Theme toggled');
  }

  toggleSidebarExpansion(): void {
    // Implement logic to allow sidebar expansion on hovering
    console.log('Sidebar expansion toggled');
  }

  togglehideTasks(): void {
    // Implement logic to show or hide recently completed tasks in profile
    console.log('Show tasks toggled');
  }
}
