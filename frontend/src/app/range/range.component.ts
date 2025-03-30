import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RangeService } from '../range.service';


@Component({
  selector: 'app-range',
  templateUrl: './range.component.html',
  styleUrls: ['./range.component.scss']
})
export class RangeComponent implements OnInit {

  rangeForm: FormGroup;
  selectedStartDate: string = '';
  selectedEndDate: string = '';

  timeDifferenceInDays: number | null = null;

  firstDate:string | undefined;
  lastDate:string='';



  constructor(private fb: FormBuilder, private rangeService: RangeService) {
    this.rangeForm = this.fb.group({
      start: [''],
      end: ['']
    });
  }


  ngOnInit() {
 
      this.applyFilter()
  }

  applyFilter(){
    this.rangeForm.valueChanges.subscribe(() => {
      const startDate = this.rangeForm.get('start')!.value;
      const endDate = this.rangeForm.get('end')!.value;
      this.rangeService.updateSelectedTimeRange(startDate, endDate);
    });

    this.fetchData();
  }

  clearFilter(){
    this.rangeService.updateSelectedTimeRange('', '');
    this.fetchData();
    // location.reload()
  }

      fetchData() {
        this.rangeService.getAllData().subscribe((data: any[]) => {
          this.processData(data);
          // console.log("Fetch All Data Initiated");
        });
      }

        processData(data:any[]){
      // console.log('Fetched Data:', data); 
      const fileCounts = data.reduce((counts, item) => {
        const fileType = item.FILE_TYPE;
        counts[fileType] = counts[fileType] || { totalFiles: 0 ,totalTime: 0};
        counts[fileType].totalFiles++;
        counts[fileType].totalTime += this.convertTimeToSeconds(item.PROCESSING_TIME);
        return counts;
      }, {});

      // console.log("Total files:",fileCounts);


        // Calculate the earliest and latest timestamps from the fetched data
        const timestamps = data.map(item => item.isotimestamp);
        const validTimestamps = timestamps
        .map(dateStr => new Date(dateStr)) // Convert date strings to Date objects
        .filter(date => date instanceof Date && !isNaN(date.getTime()))
        .map(date => date.getTime());
        
  
  
      if (validTimestamps.length > 0) {
        // Calculate the minimum and maximum timestamps
        const minTimestamp = Math.min(...validTimestamps);
        const isost = new Date(minTimestamp).toISOString();

  
        const st = new Date(minTimestamp).getTime();

        const firstDateObject = new Date(isost);

        const simpleFirstDate = firstDateObject.toLocaleDateString();

        this.firstDate=simpleFirstDate;


        // console.log("fetched firstdate:", this.firstDate)
        // console.log("Early Timestamp:",isost, )
        const maxTimestamp = Math.max(...validTimestamps);

        const isoen = new Date(maxTimestamp).toISOString();
  
        const lastDateObject = new Date(isoen);

        const simpleLastDate = lastDateObject.toLocaleDateString();

        this.lastDate=simpleLastDate;

        // console.log("fetched lastDate:", this.lastDate);
        const en = new Date(maxTimestamp).getTime();
        
        // console.log("Late Timestamp:",isoen, );
      
        const currentDate = new Date();
        const cD=currentDate.getTime();
        
        this.timeDifferenceInDays = calcdiff(st, cD);
        console.log("Time difference in days:", this.timeDifferenceInDays);
      }
  
       else {
        console.log('No valid timestamps found.');
        this.timeDifferenceInDays = null; // Assign null if no valid timestamps are found
      }

      const fileCountsArray: { fileType: string; averageTime: number; totalTime: number;totalFiles: number; averageFilesPerDay: number; }[] = Object.entries<any>(fileCounts)
      .map(([fileType, fileData]) => {
        // const averageFilesPerDay = Math.round(Number(fileData.totalFiles) / this.timeDifferenceInDays!); // Assuming 30 days in a month
        return {

        fileType,
        averageTime: Math.round(fileData.totalTime / fileData.totalFiles),
        totalFiles: fileData.totalFiles,
        averageFilesPerDay: Math.round(Number(fileData.totalFiles) / this.timeDifferenceInDays!),
        totalTime: fileData.totalTime 
      };
       }
       );   
       const sumOfAverageFilesPerDay = fileCountsArray.reduce((sum, fileData) => {
        return sum + fileData.averageFilesPerDay;
      }, 0);
      

      // console.log("filecounts array:", fileCountsArray)

      // console.log("Sum of average files per day:", sumOfAverageFilesPerDay);
                
      // Sort the file counts by totalFiles in descending order
      const sortedFileCountsArray = fileCountsArray.sort((a, b) => b.totalFiles - a.totalFiles);

      // Take the top 8 file types
      const top8FileCounts = sortedFileCountsArray.slice(0, 8);

      // Calculate the total files for the "Other" category
      const otherTotalFiles = sortedFileCountsArray.slice(8).reduce((total, fileType) => total + fileType.totalFiles, 0);
      const otherTotalTime = sortedFileCountsArray.slice(8).reduce((total, fileTypeData) => total + fileTypeData.totalTime, 0);
    
      const averageTimeForOther = Math.round(otherTotalTime / otherTotalFiles);
   
      // Create an "Other" category
      const otherCategory = {
      fileType: 'Others',
      totalFiles: otherTotalFiles,
      averageTime:averageTimeForOther,
      totalTime:0,
      averageFilesPerDay: Math.round(otherTotalFiles / this.timeDifferenceInDays!), // Calculate average files per day for "Other"
      };

      // Add the "Other" category to the top 8
      top8FileCounts.push(otherCategory);

      // console.log("Top 8 and Other:", top8FileCounts);
          
    
    
    function calcdiff(st: number, en: number) {
      const milliseconds = en - st;

      const seconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(milliseconds / (1000 * 60));
      const hours = Math.floor(milliseconds / (1000 * 60 * 60));
      const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

      // console.log("Number of days:",days);
      return days;
    }

      // Calculate the average number of files processed per day for each file type
      const totalFilesProcessedPerDay=Math.round(Number(data.length/this. timeDifferenceInDays!));   
      

      // console.log("Length of data",data.length);
      // console.log("Time difference in days:",this.timeDifferenceInDays); 
      // console.log('Total Files Processed per Day:', data.length / this.timeDifferenceInDays!); // Total number of files processed per day
      // console.log('File Counts per Day:', fileCountsArray); // Average number of files processed per day for each file type
    
  }



  private convertTimeToSeconds(time: string): number {
    // const timeArray = time.split(':');
    // const seconds = parseInt(timeArray[0]) * 3600 + parseInt(timeArray[1]) * 60 + parseInt(timeArray[2]);
   const seconds=parseInt(time)/1000;
    return seconds;
  }
  
  
  onFormReset() {
    this.rangeForm.reset();
  }

  onDashboardReload(){
    window.location.reload();
  }

}

