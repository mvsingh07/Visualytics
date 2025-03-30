import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-layout3a',
  templateUrl: './layout3a.component.html',
  styleUrls: ['./layout3a.component.scss']
})
export class Layout3aComponent implements OnInit{
 
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
