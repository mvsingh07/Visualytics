import { HttpClient } from '@angular/common/http';
import { Component ,Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-iocipdialog',
  templateUrl: './iocipdialog.component.html',
  styleUrls: ['./iocipdialog.component.scss']
})
export class IocipdialogComponent {
  iocip: string[];
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.iocip=data.iocip;
   }

  ngOnInit() {
    this.updatePaginatediocip();
  }

  paginatediocip: string[] = [];
  pageSize = 10;
  currentPage = 0;
  
  updatePaginatediocip() {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatediocip = this.iocip.slice(startIndex, endIndex);
  }

  handlePageEvent(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.updatePaginatediocip();
  }

}
