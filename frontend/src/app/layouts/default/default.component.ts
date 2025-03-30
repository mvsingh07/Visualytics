import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/services/users.service';
import { ThemeService } from 'src/app/theme.service';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {

  sideBarOpen = true;
  logic=false;
  loggedInUserSettings!:Boolean;
  constructor(
    private themeService:ThemeService, private userService:UsersService
  ) { 
    
  }
  ngOnInit() { 
    // console.log("value of logic is", this.logic)
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
    // console.log("logic is not defined")
  }
  }
 
  sidebarToggled= true; 

  sideBarToggler(event:any) {
    this.sideBarOpen = !this.sideBarOpen;
  }



}