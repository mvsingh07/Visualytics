import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
// import { MatCardModule } from '@angular/material/card';
@Component({
  selector: 'app-counts',
  templateUrl: './counts.component.html',
  styleUrls: ['./counts.component.scss'],
})
export class CountsComponent {
  macrosFiles: any;
  macrosFilesCount: number; // To store the count of macrosFiles

  tableData: any;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['IOCIP', 'IOCDOMAIN'];
  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;

  constructor(private http: HttpClient) {
    this.dataSource = new MatTableDataSource<any>();
    this.macrosFilesCount = 0; // Initialize the count to 0
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.http
      .get<any[]>('http://192.168.1.131:8021/api/dataset')
      .subscribe((data) => {
        this.tableData = data;
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;

        this.macrosFiles = data.filter((item) => item.FILE_TYPE === 'DOCM');
        this.macrosFilesCount = this.macrosFiles.length; // Set the count of macrosFiles

        //  console.log("length",this.macrosFilesCount)
      });
  }
}
