// import { Component, OnInit } from '@angular/core';
// import { HttpClient } from '@angular/common/http';

// @Component({
//   selector: 'app-table',
//   templateUrl: './table.component.html',
//   styleUrls: ['./table.component.scss']
// })
// export class TableComponent implements OnInit {
//   tableData: any;

//   constructor(private http: HttpClient) { }

//   ngOnInit() {
//     this.getData();

//   }

//   getData() {
//     this.http.get<any[]>('http://192.168.1.131:8021/table-data').subscribe(data => {
//       this.tableData = data;
//     });
//   }
// }
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent implements OnInit {
  tableData: any;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['name', 'address', 'phone'];
  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;

  constructor(private http: HttpClient) {
    this.dataSource = new MatTableDataSource<any>();
  }

  ngOnInit() {
    this.getData();
  }

  getData() {
    this.http
      .get<any[]>('http://192.168.1.131:8021/table-data')
      .subscribe((data) => {
        this.tableData = data;
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
      });
  }
}
