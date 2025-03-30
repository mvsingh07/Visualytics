import { Component,OnInit } from '@angular/core';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})
export class HomepageComponent implements OnInit{
  sideBarOpen = true;

  constructor() { }

  ngOnInit() { }


  sideBarToggler(event:any) {
    this.sideBarOpen = !this.sideBarOpen;
  }
}
