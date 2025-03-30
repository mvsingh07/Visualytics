import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { DarkModeService } from 'src/app/services/dark-mode.service';
@Component({
  selector: 'app-dash',
  templateUrl: './dash.component.html',
  styleUrls: ['./dash.component.scss']
})
export class DashComponent {


  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();

  constructor(public darkModeService: DarkModeService,private toastr: ToastrService,private router:Router ,private authService: AuthService) { }
  isDropdownOpen = false;
  toggleMenu() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleDarkMode() {
    this.darkModeService.toggleDarkMode();
    this.toggleMenu(); // Close the dropdown after toggling dark mode
  }

  editProfile() {
    // Implement your edit profile logic here
    this.toggleMenu(); // Close the dropdown after selecting "Edit Profile"
  }
}
