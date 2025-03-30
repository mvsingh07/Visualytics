import { Component, OnInit, ElementRef } from '@angular/core';
import * as Highcharts from 'highcharts';
import { HttpClient } from '@angular/common/http';
import { RangeService } from 'src/app/range.service';

@Component({
  selector: 'app-widget-stackedbar',
  templateUrl: './stackedbar.component.html',
  styleUrls: ['./stackedbar.component.scss'],
})
export class StackedbarComponent implements OnInit {
  chartOptions: any = {}; // Declare chartOptions property
  Highcharts = Highcharts;
  lastHourData: any;
  successPercentage: Record<string, string> = {};
  point: any;
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

    Highcharts.setOptions({
      chart: {
        type: 'column',
        backgroundColor: '#ddfdfs',
      },

      colors: ['#000000'], // Set the color to black
      title: {
        style: {
          fontFamily: 'sans-serif',
          fontSize: '26px',
        },
        align: 'left',
      },
      subtitle: {
        style: {
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'grey',
        },
        align: 'left',
      },
    });

    this.chartOptions = {
      chart: {
        type: 'column',
        backgroundColor: 'rgba(0,0,0,0)',
      },
      title: {
        text: 'Files Statistics',
      },
      plotOptions: {
        series: {
          grouping: false,
          borderWidth: 7,
        },
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        pointFormat:
          '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y} files</b><br/>' +
          'Success Percentage: <b>{point.successPercentage}%</b><br/>' +
          '<span style="white-space: nowrap;">',
      },
      xAxis: {
        type: 'category',
        accessibility: {
          description: 'File types',
        },
      },
      yAxis: [
        {
          title: {
            text: 'Number of Files',
            style: {
              textAlign: 'center',
              fontWeight: 'bold',
            },
          },
          showFirstLabel: false,
          gridLineWidth: 3,
        },
      ],
      credits: {
        enabled: false,
      },
      series: [
        {
          name: 'Total Files',
          color: '#006666',
          pointPlacement: -0.2,
          linkedTo: 'main',
          data: [], // Filled later with data from the server
          pointWidth: 20,
        },
        {
          name: 'Success Files',
          color: '#a6ccd9',
          id: 'main',
          data: [], // Filled later with data from the server
          pointWidth: 10,
        },
      ],
      exporting: {
        allowHTML: true,
      },
    };
  }

  fetchData() {
    this.rangeService.getAllData().subscribe((data: any[]) => {
      this.processData(data);
      // console.log('Fetch All Data Initiated');
    });
  }

  fetchRangeData(startDate: string, endDate: string) {
    this.rangeService
      .getRangeData(startDate, endDate)
      .subscribe((data: any[]) => {
        this.processData(data);
        // console.log('Fetch Range Data Initiated');
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
    const successFilesData = data.filter((item) => item.STATUS === '200');
    const fileCounts = this.calculateFileCounts(data);
    const sortedFileCounts = this.sortFileCounts(fileCounts);
    console.log('Sortd file ount:', sortedFileCounts);

    const top15FileCounts = sortedFileCounts.slice(0, 15);
    const otherFileCounts = sortedFileCounts.slice(15);
    const otherTotalFiles = this.calculateTotalFiles(otherFileCounts);
    const successFilesCount = this.calculateFileCounts(successFilesData);

    const sortedSuccessFilesCount = this.sortFileCounts(successFilesCount);
    const top15successFileCount = sortedSuccessFilesCount.slice(0, 15);
    const otherSuccessFileCounts = sortedSuccessFilesCount.slice(15);
    console.log('Other success File:', otherSuccessFileCounts);
    const otherSuccessFiles = this.calculateTotalFiles(otherSuccessFileCounts);

    // console.log("Sorted Files:", sortedFileCounts);
    top15FileCounts.push({
      name: 'Others',
      totalFiles: otherTotalFiles,
      successRate: 0, // Modify as needed
    });

    top15successFileCount.push({
      name: 'Others',
      totalFiles: otherSuccessFiles,
      successRate: 0,
    });

    const categories = top15FileCounts.map((fileCount) => fileCount.name);

    for (const fileType in sortedFileCounts) {
      if (sortedFileCounts.hasOwnProperty(fileType)) {
        const totalFilesCount = sortedFileCounts[fileType].totalFiles;
        const successFilesCount = sortedSuccessFilesCount[fileType]
          ? sortedSuccessFilesCount[fileType].totalFiles
          : 0;
        const percentage = (successFilesCount / totalFilesCount) * 100 || 0;
        this.successPercentage[fileType] = percentage.toFixed(2);
      }
    }

    this.chartOptions.series[0].data = this.getData(
      top15FileCounts,
      otherFileCounts
    );
    this.chartOptions.series[1].data = this.getData(
      top15successFileCount,
      otherSuccessFileCounts
    );
    this.chartOptions.xAxis.categories = categories;
    this.initializeHighchart();
  }

  private calculateFileCounts(
    data: any[]
  ): Record<string, { totalFiles: number }> {
    return data.reduce((counts, item) => {
      const fileType = item.FILE_TYPE;
      counts[fileType] = counts[fileType] || { totalFiles: 0 };
      counts[fileType].totalFiles++;
      return counts;
    }, {});
  }

  private sortFileCounts(
    fileCounts: Record<string, { totalFiles: number }>
  ): { name: string; totalFiles: number; successRate: number }[] {
    return Object.keys(fileCounts)
      .map((name) => ({ name, ...fileCounts[name], successRate: 0 })) // Include a default successRate of 0
      .sort((a, b) => b.totalFiles - a.totalFiles);
  }

  private calculateTotalFiles(
    fileCounts: { name: string; totalFiles: number; successRate: number }[]
  ): number {
    return fileCounts.reduce(
      (total, fileCount) => total + fileCount.totalFiles,
      0
    );
  }

  initializeHighchart() {
    this.chartOptions.chart = {
      type: 'column',
      renderTo: this.elementRef.nativeElement.querySelector('#chartContainer'), // Replace with your chart container ID
    };

    // Initialize the Highcharts chart and return the chart instance
    return this.Highcharts.chart(this.chartOptions);
  }

  getData(data: any, successData: any) {
    return Object.keys(data).map((fileType) => ({
      name: fileType,
      y: data[fileType].totalFiles,
      successRate: successData[fileType] ? successData[fileType].totalFiles : 0,
      successPercentage: this.successPercentage[fileType] || 0, // Include the successPercentage attribute
    }));
  }
}
