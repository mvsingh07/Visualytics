import { Component, OnInit } from '@angular/core';
import { OptionsPointIntervalUnitValue } from 'highcharts';
import { UsersService } from 'src/app/services/users.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit{

  
  sideBarOpen = true;
  logic=false;
  loggedInUserSettings!:Boolean;
  constructor(private userService:UsersService) { }

  ngOnInit() { 
    this.userService.fetchLoggedInUserInfo().subscribe(
      (userInfo:any)=>{
        this.loggedInUserSettings=userInfo?.sidebarExpansion;
       
        if(this.loggedInUserSettings==false){
          this.logic=false;
        }

        else if(this.loggedInUserSettings==true){
          this.logic=!this.logic;
        }

      })
  }
 

  onToggleSidebar(event: any): void {
    if (this.logic === true)
    { 
      if(event === false) {
      // Untoggle the sidebar
      this.sideBarOpen =!this.sideBarOpen;
    } else {
      // Handle toggling the sidebar (your existing toggle code)
      this.sideBarOpen =!this.sideBarOpen;
    }
  }

  else{
    console.log("logic is not defined")
  }
  }
 
  sidebarToggled= true; 

  sideBarToggler(event:any) {
    this.sideBarOpen = !this.sideBarOpen;
  }
     

}
