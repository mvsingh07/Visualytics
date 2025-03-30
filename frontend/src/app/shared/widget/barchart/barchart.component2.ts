import { Component, OnInit, ElementRef } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HttpClient } from '@angular/common/http';
import { RangeService } from 'src/app/range.service';

@Component({
  selector: 'app-widget-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.scss']
})
export class BarchartComponent implements OnInit {
  chartOptions: any = {};
  Highcharts = Highcharts;

  constructor(private http: HttpClient,private rangeService:RangeService, private elementRef: ElementRef) {}

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
      console.log("Fetch All Data Initiated");
    });
  }

  fetchRangeData(startDate: string, endDate: string) {
    this.rangeService.getRangeData(startDate, endDate).subscribe((data: any[]) => {
      this.processData(data);
      console.log("Fetch Range Data Initiated");
    });
  }



    processData(data:any[]){
    
      const fileCounts = data.reduce((counts, item) => {
        const fileType = item.FILE_TYPE;
        const processingTime = this.convertTimeToSeconds(item.PROCESSING_TIME);
        counts[fileType] = counts[fileType] || { count: 0, totalTime: 0 };
        counts[fileType].count++;
        counts[fileType].totalTime += processingTime;
        return counts;
      }, {});

     // Specify the type of 'fileCountsArray'
     const fileCountsArray: { fileType: string; averageTime: number; }[] = Object.entries<any>(fileCounts)
     .map(([fileType, fileData]) => ({
       fileType,
       averageTime: Math.round(fileData.totalTime / fileData.count)
     }));


      const overallAverageTime = Math.round(
        fileCountsArray.reduce((sum, data) => sum + data.averageTime, 0) / fileCountsArray.length
      );

      this.chartOptions = {
        chart: {
          type: 'bar',
        },
        title: {
          text: 'Average Time To Process Files',
          align: 'left'
        },
        subtitle: {
          text: `<b>Overall Average Processing Time: <span style="font-size:15px; color:#00330">${overallAverageTime} Seconds</span></b>`,
          align: 'left'
        },
        xAxis: {
          categories: fileCountsArray.map(data => data.fileType),
          title: {
            text: 'File Types',
            style: {
              fontWeight: 'bold'
            }
          },
          gridLineWidth: 1,
          lineWidth: 0
        },
        yAxis: {
          min: 0,
          title: {
            text: 'Average Time In Seconds',
            align: 'high',
            style: {
              fontWeight: 'bold'
            }
          },
          labels: {
            overflow: 'justify'
          },
          gridLineWidth: 0
        },
        tooltip: {
          valueSuffix: '  Seconds'
        },
        plotOptions: {
          bar: {
            borderRadius: '20%',
            dataLabels: {
              enabled: true,
              inside: true,
              color: '#fff',
              style: {
                textOutline: 'none'
              },
              format: '{y} Seconds'
            },
            groupPadding: 0.1,
            color: 'rgb(31, 67, 122)'
          }
        },
        credits: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        series: [{
          name: 'Average Processing Time',
          data: fileCountsArray.map(data => data.averageTime)
        }]
      };

      setTimeout(() => {
        Highcharts.chart(this.elementRef.nativeElement.querySelector('#chartContainer'), this.chartOptions);
      }, 0);
    }
  

  // Function to convert time in "hh:mm:ss" format to seconds
  private convertTimeToSeconds(time: string): number {
    const timeArray = time.split(':');
    const seconds = parseInt(timeArray[0]) * 3600 + parseInt(timeArray[1]) * 60 + parseInt(timeArray[2]);
    return seconds;
  }
}
