import { Component, OnInit, ElementRef } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HttpClient } from '@angular/common/http';
import { RangeService } from 'src/app/range.service';
@Component({
  selector: 'app-widget-combination',
  templateUrl: './combination.component.html',
  styleUrls: ['./combination.component.scss'],
})
export class CombinationComponent implements OnInit {
  chartOptions: any = {};
  Highcharts = Highcharts;

  timeDifferenceInDays: number | null = null;
  lastHourData: any;

  constructor(
    private http: HttpClient,
    private rangeService: RangeService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    this.rangeService.selectedTimeRange$.subscribe(({ startDate, endDate }) => {
      if (startDate && endDate) {
        this.fetchRangeData(startDate, endDate);
      } else {
        this.fetchLastHourData();
      }
    });
  }

  fetchRangeData(startDate: string, endDate: string) {
    this.rangeService
      .getRangeData(startDate, endDate)
      .subscribe((data: any[]) => {
        this.processData(data);
        // console.log("Fetch Range Data Initiated");
      });
  }
  fetchLastHourData() {
    this.rangeService.getLastHourData().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.lastHourData = response.data;
          this.processData(this.lastHourData);
        } else {
          this.displayNoDataMessage();
        }
      },
      error: (error) => {
        console.error('❌ Error processing data:', error);
      },
    });
  }

  displayNoDataMessage() {
    console.log("Displaying 'No Data' message...");
  }
  processData(data: any[]) {
    // console.log('Fetched Data:', data);
    const fileCounts = data.reduce((counts, item) => {
      const fileType = item.FILE_TYPE;
      counts[fileType] = counts[fileType] || { totalFiles: 0, totalTime: 0 };
      counts[fileType].totalFiles++;
      counts[fileType].totalTime += this.convertTimeToSeconds(
        item.PROCESSING_TIME
      );
      return counts;
    }, {});

    // console.log("Total fileesss:",fileCounts);

    // Calculate the earliest and latest timestamps from the fetched data
    const timestamps = data.map((item) => item.isotimestamp);
    const validTimestamps = timestamps
      .map((dateStr) => new Date(dateStr)) // Convert date strings to Date objects
      .filter((date) => date instanceof Date && !isNaN(date.getTime()))
      .map((date) => date.getTime());

    if (validTimestamps.length > 0) {
      // Calculate the minimum and maximum timestamps
      const minTimestamp = Math.min(...validTimestamps);
      const isost = new Date(minTimestamp).toISOString();

      const st = new Date(minTimestamp).getTime();
      console.log('Early Timestamp:', isost);
      console.log('st value', st);
      const maxTimestamp = Math.max(...validTimestamps);
      const isoen = new Date(maxTimestamp).toISOString();

      const en = new Date(maxTimestamp).getTime();
      console.log('Late Timestamp:', isoen);
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString();
      console.log(formattedDate); // Output: "2024-05-25T18:46:15.355Z"

      console.log('current date', currentDate);
      const cD = currentDate.getTime();
      const now = new Date(formattedDate).getTime();
      console.log('cd value:', cD);
      console.log('nowd value:', now);
      const timeDifferenceInDays = calcdiff(st, cD);
      this.timeDifferenceInDays = Math.abs(timeDifferenceInDays);
      console.log('Time difference in days:', this.timeDifferenceInDays);
    } else {
      console.log('No valid timestamps found.');
      this.timeDifferenceInDays = null; // Assign null if no valid timestamps are found
    }

    const fileCountsArray: {
      fileType: string;
      averageTime: number;
      totalTime: number;
      totalFiles: number;
      averageFilesPerDay: number;
    }[] = Object.entries<any>(fileCounts).map(([fileType, fileData]) => {
      // const averageFilesPerDay = Math.round(Number(fileData.totalFiles) / this.timeDifferenceInDays!); // Assuming 30 days in a month
      return {
        fileType,
        averageTime: Math.round(fileData.totalTime / fileData.totalFiles),
        totalFiles: fileData.totalFiles,
        averageFilesPerDay: Math.round(
          Number(fileData.totalFiles) / this.timeDifferenceInDays!
        ),
        totalTime: fileData.totalTime,
      };
    });
    // const sumOfAverageFilesPerDay = fileCountsArray.reduce((sum, fileData) => {
    //   return sum + fileData.averageFilesPerDay;
    // }, 0);

    const sortedFileCountsArray = fileCountsArray.sort(
      (a, b) => b.totalFiles - a.totalFiles
    );

    // Take the top 8 file types
    const top15FileCounts = sortedFileCountsArray.slice(0, 15);

    // Calculate the total files for the "Other" category
    const otherTotalFiles = sortedFileCountsArray
      .slice(15)
      .reduce((total, fileType) => total + fileType.totalFiles, 0);
    const otherTotalTime = sortedFileCountsArray
      .slice(15)
      .reduce((total, fileTypeData) => total + fileTypeData.totalTime, 0);

    const averageTimeForOther = Math.round(otherTotalTime / otherTotalFiles);

    // Create an "Other" category
    const otherCategory = {
      fileType: 'Others',
      totalFiles: otherTotalFiles,
      averageTime: averageTimeForOther,
      totalTime: 0,
      averageFilesPerDay: Math.round(
        otherTotalFiles / this.timeDifferenceInDays!
      ), // Calculate average files per day for "Other"
    };

    // Add the "Other" category to the top 15
    top15FileCounts.push(otherCategory);

    // console.log("Top 8 and Other:", top15FileCounts);

    function calcdiff(st: number, en: number) {
      const milliseconds = en - st;

      // const seconds = Math.floor(milliseconds / 1000);
      // const minutes = Math.floor(milliseconds / (1000 * 60));
      // const hours = Math.floor(milliseconds / (1000 * 60 * 60));
      const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

      // console.log("Number of days:",days);
      if (days > 0) {
        return days;
      } else {
        return 1;
      }
    }

    // Calculate the average number of files processed per day for each file type
    const totalFilesProcessedPerDay = Math.round(
      Number(data.length / this.timeDifferenceInDays!)
    );

    this.chartOptions = {
      chart: {
        type: 'column',

        style: {
          fontFamily: 'Arial, sans-serif',
        },
      },
      title: {
        text: 'Rate of Transformation',
        style: {
          fontSize: '24px',
          fontWeight: 'bold',
        },
        align: 'left',
      },

      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y} files</b><br/>' +
          'Average Time: <b>{point.averageTime} seconds</b><br/>' +
          '<span style="white-space: nowrap;">',
      },
      xAxis: {
        categories: top15FileCounts.map((data) => data.fileType),
      },
      yAxis: {
        title: {
          text: 'Files Processed per Day',
          style: {
            textAlign: 'center',
            fontWeight: 'bold',
          },
        },
        gridLineWidth: 3,
      },

      plotOptions: {
        series: {
          borderRadius: '15%',
          pointWidth: 25,
        },
      },
      series: [
        {
          color: '#006666',
          type: 'column',
          name: 'Average Files Processed per Day',
          data: top15FileCounts.map((data) => ({
            y: data.averageFilesPerDay,
            averageTime: data.averageTime,
          })),
        },
      ],

      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
    };

    setTimeout(() => {
      Highcharts.chart(
        this.elementRef.nativeElement.querySelector('#chartContainer'),
        this.chartOptions
      );
    }, 0);
  }
  private convertTimeToSeconds(time: string): number {
    const seconds = parseInt(time) / 1000;
    return seconds;
  }
}
