import { Component, OnInit} from '@angular/core';

import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-widget-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit {


  ngOnInit(): void {
    
    document.addEventListener('DOMContentLoaded', function () {
    const iconBar = document.querySelector('.icon-bar');
    const links = iconBar!.querySelectorAll('a');
  
    links.forEach(function (link) {
      link.addEventListener('click', function () {
        // Remove active class from all links
        links.forEach(function (otherLink) {
          otherLink.classList.remove('active');
        });
  
        // Add active class to the clicked link
        link.classList.add('active');
      });
    });
  });
    
  }
  constructor(private toastr: ToastrService) {}


  showSuccess() {
    this.toastr.success('Hello world!', 'Toastr fun!');
    // alert("hiooo")
  }
  }

