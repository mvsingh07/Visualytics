import { Component ,OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RangeService } from 'src/app/range.service';
@Component({
  selector: 'app-widget-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.scss']
})

export class ResultComponent implements OnInit{
  timeDifferenceInDays: number | null = null;
  totalFiles: number = 0;
  successFiles:number =0;
  successFilesInRange:number=0;
  totalVolume:number=0;
  
  // totalVolumeInBytes:number=0;
  
  totalVolumeInRange:number=0;
  VolumeInMb:number=0;
  successRate:number=0;
     constructor(private http: HttpClient, private rangeService:RangeService){}

     ngOnInit(){

      this.rangeService.selectedTimeRange$.subscribe(({ startDate, endDate }) => {
        if (startDate && endDate) {
          this.fetchRangeData(startDate, endDate);
        } else {
          this.fetchData();
        }
      });


     }
       

  fetchData() {
    this.rangeService.getAllData().subscribe((data: any[]) => {
      this.processData(data);
      // console.log("Fetch All Data Initiated");
    });
  }

  fetchRangeData(startDate: string, endDate: string) {
    this.rangeService.getRangeData(startDate, endDate).subscribe((data: any[]) => {
      this.processData(data);
      // console.log("Fetch Range Data Initiated");
    });
  }



     processData(data:any[]){
     

      
        // console.log('Fetched Data:', data); 
          const fileCounts=data.reduce((counts,item)=>{
              const statusType=item.STATUS;
              counts[statusType]=counts[statusType]||{totalFiles:0};
              counts[statusType].totalFiles++;
              return counts;
             

          },{});

          // console.log("Total processed:",fileCounts);
       

// <-------------------For Time Range Calculation ---------------------------->


          const timestamps = data.map(item => item.TIMESTAMP);
          const validTimestamps = timestamps
          .map(dateStr => new Date(dateStr)) // Convert date strings to Date objects
          .filter(date => date instanceof Date && !isNaN(date.getTime()))
          .map(date => date.getTime());
          
        
        if (validTimestamps.length > 0) {
          // Calculate the minimum and maximum timestamps
          const minTimestamp = Math.min(...validTimestamps);
          const isost = new Date(minTimestamp).toISOString();
          const st = new Date(minTimestamp).getTime();
        
          const maxTimestamp = Math.max(...validTimestamps);
          const isoen = new Date(maxTimestamp).toISOString();
          const en = new Date(maxTimestamp).getTime();
        
          // console.log('Earliest Timestamp:', isost);
          // console.log('Latest Timestamp:', isoen);
        
          this.timeDifferenceInDays = calcdiff(st, en);
          // console.log("Time difference in days:", this.timeDifferenceInDays);
        }
         else {
          console.log('No valid timestamps found.');
          this.timeDifferenceInDays = null; // Assign null if no valid timestamps are found
        }
        
        function calcdiff(st: number, en: number) {
          const milliseconds = en - st;
          const seconds = Math.floor(milliseconds / 1000);
          const minutes = Math.floor(milliseconds / (1000 * 60));
          const hours = Math.floor(milliseconds / (1000 * 60 * 60));
          const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
          return days;
        }
// <-------------------For Time Range Calculation ---------------------------->\\
      this.successFiles = fileCounts['SUCCESS'] ? fileCounts['SUCCESS'].totalFiles : 0;


      this.successFilesInRange= Math.round(Number(this.successFiles/this.timeDifferenceInDays!))

     const totalFiles=data.length;

     this.successRate = (this.successFiles / totalFiles) * 100;

     this.totalFiles = data.length;
     


      const fileSizes = data.map((item) => item.FILE_SIZE);

    this.totalVolume = fileSizes.reduce((total, size) => total + this.convertSizeToMegaBytes(size), 0);


    // this.totalVolumeInBytes = fileSizes.reduce((total, size) => total + this.convertSizeToBytes(size), 0);
      this.totalVolumeInRange=Math.round(Number(this.totalVolume/this.timeDifferenceInDays!));
      }



     


     convertSizeToMegaBytes(size: string): number {
      const [value, unit] = size.split(' ');
      let megaBytes = parseFloat(value);
    
      if (unit === 'KB') {
        megaBytes /= 1024; // Convert KB to MB
      } else if (!unit || unit === 'B') {

        megaBytes /= (1024 * 1024);   // Convert Bytes to MB
    }
    
      return megaBytes;
    }
    
  // convertSizeToBytes(size: string): number {
  //   const [value, unit] = size.split(' ');
  //   let bytes = parseFloat(value);

  //   if (unit === 'KB') {
  //     bytes *= 1024;
  //   } else if (unit === 'MB') {
  //     bytes *= 1024 * 1024;
  //   }
  //   return bytes;
  // }

}
