import { HttpClient } from '@angular/common/http';
import { Component ,Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-iocdomaindialog',
  templateUrl: './iocdomaindialog.component.html',
  styleUrls: ['./iocdomaindialog.component.scss']
})
export class IocdomaindialogComponent {
  iocdomain: string[];
  length: any;
  tableData: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private http: HttpClient) { 
    this.iocdomain = data.iocdomain;
  }

  paginatediocdomain: string[] = [];
  pageSize = 10;
  currentPage = 0;
  
  ngOnInit() {
    this.updatePaginatediocdomain();
  }

  updatePaginatediocdomain() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatediocdomain = this.iocdomain.slice(startIndex, endIndex);
  }

  handlePageEvent(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatediocdomain();
  }
}
