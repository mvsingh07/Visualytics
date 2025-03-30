import { Component , OnInit, Output, EventEmitter} from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UsersService } from 'src/app/services/users.service';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-extension',
  templateUrl: './extension.component.html',
  styleUrls: ['./extension.component.scss']
})
export class ExtensionComponent implements OnInit {


  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();
  loggedInUserName: string | undefined;

  constructor(private toastr: ToastrService,private router:Router ,private authService: AuthService,private userService: UsersService) { }

  ngOnInit(): void {
    this.userService.fetchLoggedInUserInfo().subscribe(
      (userInfo: any) => {
        this.loggedInUserName = userInfo?.name;
      },
      (error) => {
        console.error('Error fetching user information:', error);
      }
    );
  }

  onIconHover() {
    // Your event handler code here
    // console.log('Icon hovered');
    this.toggleSideBarForMe.emit();
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
    // alert('Icon hovered');
  }
  onIconLeave() {
    // console.log('Mouse left the icon');
    // Request the parent component to untoggle the sidebar
    this.toggleSideBarForMe.emit(false);
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300); // Pass a value indicating to untoggle the sidebar
  }

  login(){
    this.router.navigate(['user-login'])
  }
  
  logout() {
    this.authService.logout(); // Call the logout() method from the AuthService
    // this.router.navigate(['']);
    this.toastr.success( 'Login to gain access','Signed Out', {
      // toastClass: 'toast-custom',
      closeButton: true, // Show a close button on the toast
      // progressBar: true, // Show a progress bar
      positionClass: 'toast-top-center', // Customize the position for this message
      timeOut: 2000, // Toast message will automatically disappear after 3 seconds
     
    });
  }
}
