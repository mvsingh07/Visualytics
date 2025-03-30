import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { IocDialogComponent } from 'src/app/components/ioc-dialog/ioc-dialog.component';

interface CountInfo {
  totalFiles: number;
}

@Component({
  selector: 'app-pic',
  templateUrl: './pic.component.html',
  styleUrls: ['./pic.component.scss'],
})
export class PicComponent implements OnInit {
  pageSizeOptions: number[] = [15]; // Default pageSizeOptions

  macrosFiles: any;
  macrosFilesCount: number; // To store the count of macrosFiles
  IOC: number = 0;
  tableData: any;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['IOCDOMAIN', 'totalFiles'];
  @ViewChild(MatPaginator, { static: true })
  paginator!: MatPaginator;

  constructor(private http: HttpClient, private dialog: MatDialog) {
    this.dataSource = new MatTableDataSource<any>();
    this.macrosFilesCount = 0; // Initialize the count to 0
    this.adjustPageSizeOptions(window.innerHeight);
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.adjustPageSizeOptions(window.innerHeight);
  }

  // Function to adjust pageSizeOptions based on screen width
  private adjustPageSizeOptions(screenHeight: number): void {
    if (screenHeight >= 850) {
      this.pageSizeOptions = [16]; // Adjust for large screens
    } else if (screenHeight >= 650) {
      this.pageSizeOptions = [14]; // Default for small screens
    } else {
      this.pageSizeOptions = [13]; // Default for small screens
    }
  }
  ngOnInit() {
    this.getData();
  }
  getData() {
    this.http
      .get<any[]>('http://192.168.1.131:8021/api/dataset')
      .subscribe((data: any[]) => {
        const fileCounts = data.reduce(
          (counts: Record<string, CountInfo>, item) => {
            const Type = item.IOCDOMAIN;
            counts[Type] = counts[Type] || { totalFiles: 0 };
            counts[Type].totalFiles++;
            return counts;
          },
          {}
        );

        const domainCounts = Object.entries(fileCounts).map(
          ([IOCDOMAIN, counts]) => ({
            IOCDOMAIN,
            totalFiles: counts.totalFiles,
          })
        );

        domainCounts.sort((a, b) => b.totalFiles - a.totalFiles);
        this.dataSource.data = domainCounts;
        this.dataSource.paginator = this.paginator;
      });
  }

  // showIocdomain(iocDomain: string) {
  //   alert(`IOC Domain: ${iocDomain}`);
  // }

  showIocdomain(iocDomain: string[]) {
    this.dialog.open(IocDialogComponent, {
      data: { iocDomain },
    });
    console.log('ioc domain:', iocDomain);
  }
}
