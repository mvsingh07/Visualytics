import { Component , OnInit } from '@angular/core';

@Component({
  selector: 'app-layout3',
  templateUrl: './layout3.component.html',
  styleUrls: ['./layout3.component.scss']
})
export class Layout3Component implements OnInit{

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
