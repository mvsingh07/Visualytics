import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-regular',
  templateUrl: './regular.component.html',
  styleUrls: ['./regular.component.scss']
})
export class RegularComponent implements OnInit{
  sideBarOpen = true;

  constructor() { }

  ngOnInit() { }
  sidebarToggled= false; 

  sideBarToggler(event:any) {
    this.sideBarOpen = !this.sideBarOpen;
  }

   onToggleSidebar(event: any) {
    if (event === false) {
      // Untoggle the sidebar
      // this.sideBarOpen = !this.sideBarOpen;
    } else {
      // Handle toggling the sidebar (your existing toggle code)
      // this.sideBarOpen = !this.sideBarOpen;
    }
  }
   

}
