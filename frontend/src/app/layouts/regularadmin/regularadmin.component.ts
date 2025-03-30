import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-regularadmin',
  templateUrl: './regularadmin.component.html',
  styleUrls: ['./regularadmin.component.scss']
})
export class RegularadminComponent implements OnInit {
  sideBarOpen = false;

  constructor() { }
  ngOnInit() { }
  sidebarToggled= false; 

  sideBarToggler(event:any) {
    this.sideBarOpen = !this.sideBarOpen;
  }

   onToggleSidebar(event: any) {
    if (event === false) {
      // Untoggle the sidebar
      this.sideBarOpen = !this.sideBarOpen;
    } else {
      // Handle toggling the sidebar (your existing toggle code)
      this.sideBarOpen = !this.sideBarOpen;
    }
  }
}
