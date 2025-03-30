import { Component, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RangeService } from 'src/app/range.service';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-file-report',
  templateUrl: './file-report.component.html',
  styleUrls: ['./file-report.component.scss']
})

export class FileReportComponent implements OnInit{
  filterForm: FormGroup; 
  constructor(private fb: FormBuilder, private rangeService: RangeService,private http: HttpClient,private renderer: Renderer2) {
    this.dataSource = new MatTableDataSource<any>();
    this.filterForm = this.fb.group({
      
      selectedFileType: [''], // Initialize form controls with default values
      selectedTransFileType: [''],
      selectedStatusType:[''],
      selectedIocDomain:['']
    });
  }

  ngOnInit() {
    this.getData();
  }

  tableData: any;
  dataSource: MatTableDataSource<any>;
  uniqueFileTypes: string[] = [];
  uniqueTransFileTypes:string[]=[];
  uniqueStatusTypes: string[] = [];
  uniqueIocDomain:string[]=[];

  // Combine all filter values into a single string to trigger filtering
  showAdditionalFilter: boolean = false; // Initialize it as false to hide the content by default
  showCompleteReport:boolean=true;
  showTimelyReport:boolean=true;
  showFilteredReport: boolean= true;
  showContainer: boolean = true;

  async startDownload() {

    const serverUrl1 = 'http://192.168.1.131:8021/api/create-bar';
    const serverUrl2 = 'http://192.168.1.131:8021/api/pie-chart';
  
    try {
      // Use Promise.all to make both requests concurrently
      const [response1, response2] = await Promise.all([
        fetch(serverUrl1, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Send the queryConditions as JSON in the request body
        }),
        fetch(serverUrl2, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Send the queryConditions as JSON in the request body
        }),
      ]);
  
      // Check if both responses are successful
      if (response1.status === 200 && response2.status === 200) {
        console.log('Images and pie chart are ready for download.');
  
        // Now that both responses have been received, call downloadPdf
        this.rangeService.downloadPdf();
      } else {
        console.error('Image or pie chart creation on the server failed.');
      }
    } catch (error) {
      console.error('An error occurred: ', error);
    }
  }
  
  startDownload11(){

    const serverUrl = 'http://192.168.1.131:8021/api/create-bar';
  
    fetch(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
  // Send the queryConditions as JSON in the request body
    })
      .then(response => {
        if (response.status === 200) {
          // Image is ready for download on the server; you can display a message to the user if needed.
          console.log('Image is ready for download.');
        } else {
          // Handle the case when image creation on the server fails
          console.error('Image creation on the server failed.');
        }
      })
      .catch(error => {
        console.error('An error occurred: ', error);
      });


      const serverUrl2 = 'http://192.168.1.131:8021/api/pie-chart';

      // Create an anchor element to trigger the download
      fetch(serverUrl2, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
         // Send the queryConditions as JSON in the request body
      })
      .then(response => {
        if (response.status === 200) {
          // Image is ready for download on the server; you can display a message to the user if needed.
          console.log('Pie chart is ready .');
        } else {
          // Handle the case when image creation on the server fails
          console.error('Pie chart creation on the server failed.');
        }
      })
      .catch(error => {
        console.error('An error occurred: ', error);
      });

        this.rangeService.downloadPdf();
        
  }

  async startDownload2() {

    try{
    this.rangeService.selectedTimeRange$.subscribe(async ({ startDate, endDate }) => {

      const queryConditions: any = {};
  
      if (startDate) {
        queryConditions.startDate = startDate;
      }
  
      if (endDate) {
        queryConditions.endDate = endDate;
      }
  
      if (this.filterForm.value.selectedFileType) {
        queryConditions.selectedFileType = this.filterForm.value.selectedFileType;
      }
  
      if (this.filterForm.value.selectedTransFileType) {
        queryConditions.selectedTransFileType = this.filterForm.value.selectedTransFileType;
      }
  
      if (this.filterForm.value.selectedStatusType) {
        queryConditions.selectedStatusType = this.filterForm.value.selectedStatusType;
      }
  
      if (this.filterForm.value.selectedIocDomain) {
        queryConditions.selectedIocDomain = this.filterForm.value.selectedIocDomain;
      }
  
      console.log("Query conditions:", queryConditions);


      const serverUrl1 = 'http://192.168.1.131:8021/api/create-bar';

      const serverUrl2 = 'http://192.168.1.131:8021/api/pie-chart';
  
      const [response1, response2] = await Promise.all([
        fetch(serverUrl1, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(queryConditions), // Send the queryConditions as JSON
        }),
        fetch(serverUrl2, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(queryConditions), // Send the queryConditions as JSON
        }),
      ]);
  
      // Check if both responses are successful
      if (response1.status === 200 && response2.status === 200) {
        console.log('Images and pie chart are ready for download.');
  
        // Now that both responses have been received, call downloadPdf
        this.rangeService.downloadPdfRangeFilter2(queryConditions);
      } else {
        console.error('Image or pie chart creation on the server failed.');
      }
    }) }
    
    catch (error) {
      console.error('An error occurred: ', error);
    }

    // Send the queryConditions to the /bar-chart API as a POST request
    }
  
  

  
  getData() {
    this.http.get<any[]>('http://192.168.1.131:8021/api/dataset').subscribe(data => {
      this.tableData = data;
      this.dataSource.data = data;
      // this.dataSource.paginator = this.paginator;
      // this.dataSource.sort = this.sort; 
      this.uniqueFileTypes = Array.from(new Set(data.map(item => item.FILE_TYPE)));
      this.uniqueTransFileTypes = Array.from(new Set(data.map(item => item.TRANS_FILE_TYPE)));
      this.uniqueStatusTypes=Array.from(new Set(data.map(item=> item.STATUS)));
      this.uniqueIocDomain= Array.from(new Set(data.map(item=>item.IOCDOMAIN)));

      console.log("Unique Ioc Domain :", this.uniqueIocDomain);
      console.log("Unique Status Types:", this.uniqueStatusTypes);
      console.log("Unique FileTypes:", this.uniqueFileTypes);
      console.log("Unique Trans FileTypes:", this.uniqueTransFileTypes);
    });
  }

 
  // downloadPdf() {
  //   // Prepare the filter options to be sent to the backend
  //   const filterOptions = {
  //     selectedFileType: this.filterForm.value.selectedFileType,
  //     selectedTransFileType: this.filterForm.value.selectedTransFileType,
  //     selectedStatusType:this.filterForm.value.selectedStatusType,
  //   };

  //   // Send a POST request to your backend route for PDF download
  //   this.http.post('http://192.168.1.131:8021/download-pdf', filterOptions, { responseType: 'blob' }).subscribe(
  //     (responseBlob: Blob) => {
  //       // Create a blob URL for the PDF and trigger the download
  //       const blobUrl = window.URL.createObjectURL(responseBlob);
  //       const link = document.createElement('a');
  //       link.href = blobUrl;
  //       link.download = 'report.pdf';
  //       link.click();
  //     },
  //     (error) => {
  //       console.error('Error downloading PDF:', error);
  //     }
  //   );
  // }

  clearFilters() {
    this.filterForm.reset(); // Assuming filterForm is the name of your form group
  }

}
