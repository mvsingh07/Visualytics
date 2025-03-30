import { HttpClient } from '@angular/common/http';
import { Component ,Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-iocemaildialog',
  templateUrl: './iocemaildialog.component.html',
  styleUrls: ['./iocemaildialog.component.scss']
})
export class IocemaildialogComponent {
  iocemail: string[];
  length: any;
  tableData: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private http: HttpClient) { 
    this.iocemail = data.iocemail;
  }

  paginatediocemail: string[] = [];
  pageSize = 10;
  currentPage = 0;
  
  ngOnInit() {
    this.updatePaginatediocemail();
  }

  updatePaginatediocemail() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatediocemail = this.iocemail.slice(startIndex, endIndex);
  }

  handlePageEvent(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatediocemail();
  }
}
