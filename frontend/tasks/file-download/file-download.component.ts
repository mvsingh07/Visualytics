import { Component, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatInput } from '@angular/material/input'; 
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-file-download',
  templateUrl: './file-download.component.html',
  styleUrls: ['./file-download.component.scss']
})
export class FileDownloadComponent {
  

  pageSizeOptions: number[] = [12];
  data: any[] = []; // 
  tableData: any;
  dataSource: MatTableDataSource<any>;
  uniqueFileTypes: string[] = [];
  uniqueTransFileTypes:string[]=[];
  uniqueStatusTypes: string[] = [];
  displayedColumns: string[] = [ 'FILE_NAME', 'FILEPATH'];
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort; 
  @ViewChild('fileTypeInput') fileTypeInput!: MatInput;



  filter:{[key:string]:string}={};
 


  constructor(private http: HttpClient,private renderer: Renderer2, private toastr:ToastrService) {
    this.dataSource = new MatTableDataSource<any>();
    this.adjustPageSizeOptions(window.innerWidth);
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.adjustPageSizeOptions(window.innerWidth);
  }


  // Function to adjust pageSizeOptions based on screen width
  private adjustPageSizeOptions(screenWidth: number): void {
    if (screenWidth >= 1524) {
      this.pageSizeOptions = [13]; // Adjust for large screens
    }  else {
      this.pageSizeOptions = [11]; // Default for small screens
    }
  }

  ngOnInit() {
    
    this.getData();

  }
  
  getData() {
    this.http.get<any[]>('http://192.168.1.131:8021/api/dataset').subscribe(data => {
      this.data = data; // Store the fetched data in the 'data' variable
      this.dataSource = new MatTableDataSource<any>(data); // Initialize the MatTableDataSource with the data
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.uniqueFileTypes = Array.from(new Set(data.map(item => item.FILE_TYPE)));
      this.uniqueStatusTypes = Array.from(new Set(data.map(item => item.STATUS)));
    });
  }
  downloadFile(filepath:string){

    const link = document.createElement('a');
     link.href = `http://192.168.1.131:5000/download_file/${filepath}`;
     link.download = filepath;
     document.body.appendChild(link);
     link.click();
     this.toastr.success("File Downloaded")
     document.body.removeChild(link);
   }   
   
  applyFilter(column: string, filterValue: string) {
    // Convert the filterValue to lowercase for case-insensitive filtering
    filterValue = filterValue.trim().toLowerCase();
  
    // Store the filter value for the specified column in the filter object
    this.filter[column] = filterValue;
  
    // Create a separate filter for FILE_TYPE using regular expression
    const fileTypeFilter = this.filter['FILE_TYPE'] || ''; // Get the FILE_TYPE filter value
    const statusFilter = this.filter['STATUS'] || ''; // Get the STATUS filter value
    // const idFilter =this.filter['UNIQUE_ID'] || '';
  
    const fileTypeRegex = new RegExp(`^${fileTypeFilter}$`, 'i'); // Case-insensitive regex
    const statusRegex = new RegExp(`^${statusFilter}$`, 'i'); // Case-insensitive regex
    // const idRegex = new RegExp(`^${idFilter}$`, 'i'); // Case-insensitive regex

    // Apply filters for all columns based on the filter object
    this.dataSource.filterPredicate = (data, filter) => {
      for (const key in this.filter) {
        if (this.filter.hasOwnProperty(key)) {
          const value = this.filter[key];
          const fieldValue = data[key] ? data[key].toLowerCase() : '';
          if (key === 'FILE_TYPE') {
            // Use the fileTypeRegex for FILE_TYPE column
            if (!fileTypeRegex.test(fieldValue)) {
              return false;
            }
          } else if (key === 'STATUS') {
            // Use the statusRegex for STATUS column
            if (!statusRegex.test(fieldValue)) {
              return false;
            }
          }else {
            // Use the default filter logic for other columns
            if (!fieldValue.includes(value)) {
              return false;
            }
          }
        }
      }
      return true; // Return true if all filters match (logical AND)
    };
  
    // Combine all filter values into a single string to trigger filtering
    const combinedFilter = Object.values(this.filter).join('');
    this.dataSource.filter = combinedFilter;
  }

  


  // downloadFile(fileName: string): void {
     
  //   const url = `http://192.168.1.131:8021/download/${fileName}`;
  
  //   this.http.get(url, { responseType: 'blob' }).subscribe(
  //       (response) => {
  //         const blob = new Blob([response], { type: 'application/octet-stream' });
  //         const a = document.createElement('a');
  //         a.href = window.URL.createObjectURL(blob);
  //         a.download = fileName;
  //         document.body.appendChild(a);
  //         a.click();
  //         window.URL.revokeObjectURL(a.href);
  //         this.toastr.success("File Downloaded")
  //       },
  //       (error) => {
  //         console.error('Error downloading file', error);
  //         this.toastr.error("File not available")
  //       }
  //     );
  //   }



}



