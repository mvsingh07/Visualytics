import { HttpClient } from '@angular/common/http';
import { Component ,Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-iocurldialog',
  templateUrl: './iocurldialog.component.html',
  styleUrls: ['./iocurldialog.component.scss']
})
export class IocurldialogComponent implements OnInit {
  iocurl: string[];
  length: any;
  tableData: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private http: HttpClient) { 
    this.iocurl = data.iocurl;
  }

  paginatedIocurl: string[] = [];
  pageSize = 10;
  currentPage = 0;
  
  ngOnInit() {
    this.updatePaginatedIocurl();
  }

  updatePaginatedIocurl() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedIocurl = this.iocurl.slice(startIndex, endIndex);
  }

  handlePageEvent(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatedIocurl();
  }
}
