import { Component, OnInit, ElementRef } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HttpClient } from '@angular/common/http';
import { RangeService } from 'src/app/range.service';
interface FileTypeData {
  count: number;
  totalTime: number;
}
@Component({
  selector: 'app-widget-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.scss'],
})
export class BarchartComponent implements OnInit {
  chartOptions: any = {};
  Highcharts = Highcharts;

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
    this.rangeService
      .getRangeData(startDate, endDate)
      .subscribe((data: any[]) => {
        this.processData(data);
        // console.log("Fetch Range Data Initiated");
      });
  }

  processData(data: any[]) {
    // Your existing code to count and calculate average processing time
    const fileCounts: Record<string, FileTypeData> = data.reduce(
      (counts, item) => {
        const fileType = item.FILE_TYPE;
        counts[fileType] = counts[fileType] || { count: 0, totalTime: 0 };
        counts[fileType].count++;
        counts[fileType].totalTime += this.convertTimeToSeconds(
          item.PROCESSING_TIME
        );
        return counts;
      },
      {}
    );

    // console.log("Total fileesss:",fileCounts);
    // Calculate the total count for all file types
    const totalFilesCount: number = Object.values(fileCounts).reduce(
      (total, fileTypeData) => total + fileTypeData.count,
      0
    );

    // Create fileCountsArray with the total count
    const fileCountsArray: {
      fileType: string;
      averageTime: number;
      totalFiles: number;
      totalTime: number;
    }[] = Object.entries(fileCounts).map(([fileType, fileData]) => ({
      fileType,
      averageTime: Math.round(fileData.totalTime / fileData.count),
      totalFiles: fileData.count,
      totalTime: fileData.totalTime, // Include totalTime property
    }));

    // console.log('File Counts Array:',fileCountsArray)
    // Sort the fileCountsArray by totalFiles in descending order
    const sortedFileCountsArray = fileCountsArray.sort(
      (a, b) => b.totalFiles - a.totalFiles
    );

    const top8FileCounts = sortedFileCountsArray.slice(0, 8);
    // Calculate the total files for the "Other" category
    const otherTotalFiles =
      totalFilesCount -
      sortedFileCountsArray
        .slice(0, 8)
        .reduce((total, fileTypeData) => total + fileTypeData.totalFiles, 0);

    // Calculate the total time for the "Other" category
    const otherTotalTime = sortedFileCountsArray
      .slice(8)
      .reduce((total, fileTypeData) => total + fileTypeData.totalTime, 0);

    // Calculate the average time for the "Other" category
    const averageTimeForOther = Math.round(otherTotalTime / otherTotalFiles);

    // Create an "Other" category
    const otherCategory = {
      fileType: 'Other',
      averageTime: averageTimeForOther,
      totalFiles: otherTotalFiles,
      totalTime: 0,
    };

    // // Add the "Other" category to the top 8
    // sortedFileCountsArray.splice(8); // Keep only the top 8
    // sortedFileCountsArray.push(otherCategory);

    // console.log("Top 8 and Other:", sortedFileCountsArray);

    // Add the "Other" category to the top 8
    top8FileCounts.push(otherCategory);

    // console.log("Top 8 and Other:", top8FileCounts);

    const overallAverageTime = Math.round(
      fileCountsArray.reduce((sum, data) => sum + data.averageTime, 0) /
        fileCountsArray.length
    );

    this.chartOptions = {
      chart: {
        type: 'bar',
      },

      title: {
        text: 'Average Time To Process Files',
        align: 'left',
      },

      subtitle: {
        text: `<b>Overall Average Processing Time: <span style="font-size:15px; color:#00330">${overallAverageTime} Seconds</span></b>`,
        align: 'left',
      },

      xAxis: {
        categories: top8FileCounts.map((data) => data.fileType),
        title: {
          text: 'File Types',
          style: {
            fontWeight: 'bold',
          },
        },
        gridLineWidth: 1,
        lineWidth: 0,
      },

      yAxis: {
        min: 0,
        title: {
          text: 'Average Time In Seconds',
          align: 'high',
          style: {
            fontWeight: 'bold',
          },
        },
        labels: {
          overflow: 'justify',
        },
        gridLineWidth: 0,
      },
      tooltip: {
        valueSuffix: '  Seconds',
      },
      plotOptions: {
        bar: {
          borderRadius: '20%',
          dataLabels: {
            enabled: true,
            inside: true,
            color: '#fff',
            style: {
              textOutline: 'none',
            },
            format: '{y} Seconds',
          },
          groupPadding: 0.1,
          color: '#006666',
        },
        // rgb(25, 54, 98 )
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      series: [
        {
          name: 'Average Processing Time',
          data: top8FileCounts.map((data) => data.averageTime),
        },
      ],
    };

    setTimeout(() => {
      Highcharts.chart(
        this.elementRef.nativeElement.querySelector('#chartContainer'),
        this.chartOptions
      );
    }, 0);
  }

  // Function to convert time in "hh:mm:ss" format to seconds
  private convertTimeToSeconds(time: string): number {
    const timeArray = time.split(':');
    const seconds =
      parseInt(timeArray[0]) * 3600 +
      parseInt(timeArray[1]) * 60 +
      parseInt(timeArray[2]);
    return seconds;
  }
}
