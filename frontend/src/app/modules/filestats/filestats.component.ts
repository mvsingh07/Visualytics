import {
  Component,
  HostListener,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatInput } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { PageEvent } from '@angular/material/paginator';
import { IocurldialogComponent } from 'src/app/components/iocurldialog/iocurldialog.component';
import { PostsComponent } from '../posts/posts.component';
import { IocipdialogComponent } from 'src/app/components/iocipdialog/iocipdialog.component';
import { IocemaildialogComponent } from 'src/app/components/iocemaildialog/iocemaildialog.component';
import { IocdomaindialogComponent } from 'src/app/components/iocdomaindialog/iocdomaindialog.component';
import { MacroresultsComponent } from 'src/app/components/macroresults/macroresults.component';
import { saveAs } from 'file-saver';
import { YaraComponent } from 'src/app/components/yara/yara.component';
@Component({
  selector: 'app-filestats',
  templateUrl: './filestats.component.html',
  styleUrls: ['./filestats.component.scss'],
})
export class filestatsComponent implements OnInit {
  pageSizeOptions: number[] = [12]; // Default pageSizeOptions
  tableData: any;
  dataSource: MatTableDataSource<any>;
  uniqueFileTypes: string[] = [];
  uniqueTransFileTypes: string[] = [];
  uniqueStatusTypes: string[] = [];
  domains: string[] = []; // Single-dimensional array to store all domains

  //   displayedColumns: string[] = ['UNIQUE_ID',  'FILE_NAME', 'FILE_TYPE','TIMESTAMP','TRANSFORM_TIMESTAMP','PROCESSING_TIME','TRANS_FILE_TYPE','TRANS_FILE_NAME','FILE_SIZE',
  //  'IOCURL','IOCIP','IOCDOMAIN','IOCEMAIL' , 'STATUS','TRANS_FILE_MD5','FILE_MD5SUM'];

  displayedColumns: string[] = [
    'UNIQUE_ID',
    'FILE_NAME',
    'FILE_MD5SUM',
    'FILE_TYPE',
    'MIME_TYPE',
    'FILE_SIZE',
    'TRANS_FILE_TYPE',
    'TRANS_FILE_MD5',
    'PROCESSING_TIME',
    'STATUS',
    'INVOKEHTTPMESSAGE',
    'IOCURL',
    'IOCIP',
    'MACRORESULT',
    'MACROS',
    'IOCEMAIL',
    'IOCDOMAIN',
    'YARA_RESULTS',
    'FILEPATH',
  ];
  //
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('fileTypeInput') fileTypeInput!: MatInput;
  filter: { [key: string]: string } = {};
  iocurl!: any[];
  length!: number;

  constructor(
    private http: HttpClient,
    private renderer: Renderer2,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<any>();
    this.adjustPageSizeOptions(window.innerHeight);
  }
  paginatedIocurl: string[] = [];
  pageSize = 5;
  currentPage = 0;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.adjustPageSizeOptions(window.innerHeight);
  }

  // Function to adjust pageSizeOptions based on screen width
  private adjustPageSizeOptions(screenHeight: number): void {
    // Define the base page size option
    let basePageSize = 12;

    // Calculate additional pageSizeOptions based on screen height
    const additionalOptions = Math.floor((screenHeight - 650) / 100);

    // Ensure the basePageSize is not less than 14
    basePageSize = Math.max(basePageSize, 12);

    // Set the pageSizeOptions dynamically
    this.pageSizeOptions = [basePageSize + additionalOptions];
  }

  ngOnInit() {
    this.getData();
    // console.log('Height', window.innerHeight)
    this.updatePaginatedData();
  }

  showIocurl(iocurl: string[]) {
    const dialogRef = this.dialog.open(IocurldialogComponent, {
      data: { iocurl },
    });
  }
  isValidIocurl(iocurl: any): boolean {
    return Array.isArray(iocurl)
      ? iocurl.length > 0
      : typeof iocurl === 'string' && iocurl.trim().length > 0;
  }

  isTransformed(status: any): boolean {
    return status == 200;
  }

  showIocip(iocip: string[]) {
    const dialogRef = this.dialog.open(IocipdialogComponent, {
      data: { iocip },
    });
  }
  isValidIocip(iocip: any): boolean {
    return Array.isArray(iocip)
      ? iocip.length > 0
      : typeof iocip === 'string' && iocip.trim().length > 0;
  }

  showIocemail(iocemail: string[]) {
    const dialogRef = this.dialog.open(IocemaildialogComponent, {
      data: { iocemail },
    });
  }

  isValidIocemail(iocemail: any): boolean {
    return Array.isArray(iocemail)
      ? iocemail.length > 0
      : typeof iocemail === 'string' && iocemail.trim().length > 0;
  }

  showIocdomain(iocdomain: string[]) {
    const dialogRef = this.dialog.open(IocdomaindialogComponent, {
      data: { iocdomain },
    });
  }

  isValidIocdomain(iocdomain: any): boolean {
    return Array.isArray(iocdomain)
      ? iocdomain.length > 0
      : typeof iocdomain === 'string' && iocdomain.trim().length > 0;
  }

  showMacroData(macros: string[]) {
    const dialogRef = this.dialog.open(PostsComponent, {
      data: { macros },
    });
  }

  isValidmacro_analysis_result(macro_analysis_result: any): boolean {
    return Array.isArray(macro_analysis_result)
      ? macro_analysis_result.length > 0
      : typeof macro_analysis_result === 'string' &&
          macro_analysis_result.trim().length > 0;
  }
  isValidmacros(macros: any): boolean {
    if (Array.isArray(macros)) {
      return macros.length > 0;
    } else if (typeof macros === 'string') {
      return (
        macros.trim().length > 0 &&
        macros !== 'No VBA Macros found' &&
        macros !== 'No malicious code found'
      );
    } else {
      return false;
    }
  }

  showMacroResults(macro_analysis_result: string[]) {
    const dialogRef = this.dialog.open(MacroresultsComponent, {
      data: { macro_analysis_result },
    });
  }

  isValidYARA_RESULTS(yara: any): boolean {
    if (Array.isArray(yara)) {
      return yara.length > 0;
    } else if (typeof yara === 'string') {
      return yara.trim().length > 0;
    } else {
      return false;
    }
  }

  showYaraData(yara: string[]) {
    const dialogRef = this.dialog.open(YaraComponent, {
      data: { yara },
    });
  }

  updatePaginatedData() {
    this.http
      .get<any[]>('http://192.168.1.131:8021/api/dataset')
      .subscribe((data) => {
        this.length = data.length;
        this.tableData = data;
        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedIocurl = data
          .map((item) => item.IOCURL)
          .slice(startIndex, endIndex);
      });
  }

  getData() {
    this.http
      .get<any[]>('http://192.168.1.131:8021/api/dataset')
      .subscribe((data) => {
        // this.domains = data
        //     .map(item => item.ioc_result?.domains) // Map to get the domains array
        //     .flat() // Flatten the array of arrays into a single array
        //     .filter(domain => domain); // Filter out any undefined values

        this.tableData = data;
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.uniqueFileTypes = Array.from(
          new Set(data.map((item) => item.FILE_TYPE))
        );
        this.uniqueTransFileTypes = Array.from(
          new Set(data.map((item) => item.TRANS_FILE_TYPE))
        );
        this.uniqueStatusTypes = Array.from(
          new Set(data.map((item) => item.STATUS))
        );

        const startIndex = this.currentPage * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        // this.iocurl=data.map(item=>item.IOCURL);
        this.paginatedIocurl = data
          .map((item) => item.IOCURL)
          .slice(startIndex, endIndex);

        console.log('this.paginatedIocurl', this.paginatedIocurl);

        data.slice(0, 50).forEach((item) => {
          if (typeof item.IOCURL === 'string') {
            console.log('IOCURL Value (String):', item.IOCURL);
          } else {
            console.log('Type of item.IOCURL:', typeof item.IOCURL);
          }
        });
      });
  }

  applyFilter(column: string, filterValue: string) {
    filterValue = filterValue.trim().toLowerCase();
    this.filter[column] = filterValue;

    const fileTypeFilter = this.filter['FILE_TYPE'] || '';
    const fileTypeRegex = new RegExp(`^${fileTypeFilter}$`, 'i');

    this.dataSource.filterPredicate = (data, filter) => {
      for (const key in this.filter) {
        if (this.filter.hasOwnProperty(key)) {
          const value = this.filter[key];
          let fieldValue = data[key];

          console.log(
            `Filtering key: ${key}, value: ${value}, fieldValue:`,
            fieldValue
          );

          if (Array.isArray(fieldValue)) {
            fieldValue = fieldValue
              .map((item) => item.toString().toLowerCase())
              .join(', ');
          } else if (fieldValue) {
            fieldValue = fieldValue.toString().toLowerCase();
          } else {
            fieldValue = '';
          }

          console.log(`Processed fieldValue: ${fieldValue}`);

          if (key === 'FILE_TYPE') {
            if (!fileTypeRegex.test(fieldValue)) {
              return false;
            }
          } else {
            if (!fieldValue.includes(value)) {
              return false;
            }
          }
        }
      }
      return true;
    };

    const combinedFilter = Object.values(this.filter).join('');
    this.dataSource.filter = combinedFilter;

    console.log('Filter applied:', this.filter);
    console.log('Data source filter:', this.dataSource.filter);
  }

  // downloadFile(filepath: string): void {
  //   this.http.get(`http://192.168.1.121:8021/downloadfromnas?filepath=${encodeURIComponent(filepath)}`, {
  //     responseType: 'blob'
  //   }).subscribe(
  //     (response: Blob) => {
  //       // Extract the filename from the filepath
  //       const filename = this.extractFilename(filepath);
  //       saveAs(response, filename);
  //     },
  //     error => {
  //       console.error('Download error:', error);
  //     }
  //   );
  // }

  // private extractFilename(filepath: string): string {
  //   return filepath.split('/').pop() || 'downloaded-file';
  // }
  // downloadFile(filepath: string) {
  //   const link = document.createElement('a');
  //   link.href = `192.168.1.131:5000/download_file/${filepath}`;
  //   link.download = filepath;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }
  downloadFile(filepath: string) {
    const link = document.createElement('a');
    link.href = `http://192.168.1.131:5000/download_file/${filepath}`;
    link.download = filepath;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
