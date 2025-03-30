import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

interface Operation {
  _id: string;
  description: string;
  timestamp: string; // Added timestamp field for proper binding
  status: boolean;
  userEmail: string;
}

@Component({
  selector: 'app-operations',
  templateUrl: './operations.component.html',
  styleUrls: ['./operations.component.scss'],
})
export class OperationsComponent implements OnInit {
  displayedColumns: string[] = ['description', 'timestamp']; // Timestamp added
  dataSource = new MatTableDataSource<Operation>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  pageSizeOptions: number[] = [12, 25, 50];
  basePageSize: number = 12;

  constructor(private http: HttpClient) {
    this.adjustPageSizeOptions(window.innerHeight);
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.adjustPageSizeOptions(window.innerHeight);
  }

  /** Adjusts page size dynamically based on window height */
  private adjustPageSizeOptions(screenHeight: number): void {
    const additionalOptions = Math.floor((screenHeight - 650) / 100);
    this.pageSizeOptions = [
      Math.max(this.basePageSize, 12) + additionalOptions,
      25,
      50,
    ];
  }

  ngOnInit(): void {
    this.fetchOperations();
  }

  /** Fetch operations from API */
  fetchOperations(): void {
    this.http
      .get<Operation[]>('http://192.168.1.131:8021/api/appOperations')
      .subscribe(
        (operations) => {
          this.dataSource.data = operations;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        (error) => {
          console.error('Error fetching operations', error);
        }
      );
  }
  getTimestampClass(timestamp: string): string {
    const now = new Date();
    const timestampDate = new Date(timestamp);
    const diff = now.getTime() - timestampDate.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 12) {
      return 'recent'; // Green for recent
    } else if (hours < 48) {
      return 'medium'; // Yellow for medium
    } else {
      return 'old'; // Red for old
    }
  }
}
