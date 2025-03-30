import { Component, ElementRef, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts/highcharts';
import HighchartsGauge from 'highcharts/highcharts-more';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsExportData from 'highcharts/modules/export-data';
import SolidGauge from 'highcharts/modules/solid-gauge';
import { HttpClient } from '@angular/common/http';

HighchartsGauge(Highcharts);
HighchartsExporting(Highcharts);
HighchartsExportData(Highcharts);
// SolidGauge(Highcharts);

@Component({
  selector: 'app-widget-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss'],
})
export class AreaComponent implements OnInit {
  chartOptions: any = {};
  Highcharts = Highcharts;
  chartSpeed: Highcharts.Chart | undefined;
  chartRpm: Highcharts.Chart | undefined;
  min!: number;
  min2!: number;
  limit!: number;
  limit2!: number;
  data: any[] = [];
  rangeTotalData!: number;
  recentTotalData!: number;
  rangeData!: number;
  rangeSuccessData!: number;
  recentSuccessData!: number;
  rangeUnit!: string;
  fileTypes: any[] = [];
  constructor(private http: HttpClient, private elementRef: ElementRef) {}

  ngOnInit() {
    this.fetchData();
  }

  // Modify the fetchData method to return a Promise
  fetchData(): Promise<void> {
    return new Promise((resolve, reject) =>
      this.http.get<any[]>('http://192.168.1.131:8021/api/dataset').subscribe(
        (data: any[]) => {
          this.data = data;
          // Calculate total volume for each file type
          const fileTypeVolumes = data.reduce((acc, item) => {
            const fileType = item.FILE_TYPE;
            const volume = item.FILE_SIZE || 0; // Assuming totalVolume is a property of each item
            if (!acc[fileType]) {
              acc[fileType] = 0;
            }
            acc[fileType] += volume;
            return acc;
          }, {});

          // Convert to array and sort by totalVolume
          const sortedFileTypes = Object.keys(fileTypeVolumes)
            .map((fileType) => ({
              fileType,
              totalVolume: fileTypeVolumes[fileType],
            }))
            .sort((a, b) => b.totalVolume - a.totalVolume)
            .map((item) => item.fileType);

          this.fileTypes = sortedFileTypes;

          const currentDate = new Date();
          const istOffset = 5.5 * 60 * 60 * 1000; // 5.5 hours in milliseconds
          // Calculate the timestamp for 10 minutes ago
          const tenMinutesAgo = new Date(
            currentDate.getTime() - 2 * 120 * 1000 + istOffset + 20
          );

          console.log('currentDateTime:', currentDate);
          console.log('Ten minutes ago:', tenMinutesAgo.toISOString());

          const recentData = data.filter(
            (item) => item.isotimestamp >= tenMinutesAgo.toISOString()
          );

          const totalVolume = this.calculateTotalVolume(recentData);
          console.log('Total recent Volume>>>>>>:', totalVolume);

          const successTotalVolume = this.calculateSuccessVolume(recentData);
          console.log('Success recent Volume:', successTotalVolume);

          const funcValtotal = this.calculateDataRate(totalVolume);
          console.log('func total:', funcValtotal);

          const funcValSuccess = this.calculateDataRate(successTotalVolume);
          console.log('func success:', funcValSuccess);

          this.rangeTotalData = this.convertSize(
            this.calculateDataRate(totalVolume)
          );
          console.log('This is Range Total Data', this.rangeTotalData);

          this.rangeSuccessData = this.convertSize(
            this.calculateDataRate(successTotalVolume)
          );
          console.log('This is Range Success Data', this.rangeSuccessData);

          // // Filter data for the past 10 minutes
          // const recentTotalData = data.filter(item => item.ISOTIMESTAMP >= tenMinutesAgo);
          // const recentSuccessData = data.filter(item => item.ISOTIMESTAMP >= tenMinutesAgo);

          this.updateChartSpeed(this.rangeTotalData);
          this.updateChartRpm(this.rangeSuccessData);
          this.rangeUnit = this.convertRange(
            this.calculateDataRate(totalVolume)
          );

          if (this.rangeTotalData <= 10) {
            this.min = 0;
            this.limit = 10;
          } else if (this.rangeTotalData >= 10 && this.rangeTotalData <= 100) {
            this.min = 10;
            this.limit = 100;
          } else if (
            this.rangeTotalData >= 100 &&
            this.rangeTotalData <= 1000
          ) {
            this.min = 100;
            this.limit = 1000;
          } else {
            this.min = 0.5 * this.rangeTotalData;
            this.limit = 1.5 * this.rangeTotalData;
          }

          //   if(this.rangeSuccessData<=10){
          //     this.min2=0;
          //     this.limit2=10;
          //  }
          //  else if(this.rangeSuccessData>=10 && this.rangeSuccessData<=100) {
          //    this.min2=10;
          //    this.limit2=100;
          //  }
          //  else if(this.rangeSuccessData>=100 && this.rangeSuccessData<=1000) {
          //    this.min2=100;
          //    this.limit2=1000;
          //  }
          //  else{
          //  this.min2 = 0.5*this.rangeSuccessData;
          //  this.limit2 = 1.5 * this.rangeSuccessData;
          //  }

          this.chartSpeed = this.createChart(
            'container-speed',
            'Data Inflow Rate',
            'Volume of Data Received Per Second',
            this.rangeTotalData,
            this.limit,
            this.rangeUnit
          );
          this.chartRpm = this.createChart(
            'container-rpm',
            'Data Processing Rate',
            'Volume of Data Processed Per Second',
            this.rangeSuccessData,
            this.limit,
            this.rangeUnit
          );
          resolve();
        },
        (error) => {
          console.error('Error fetching data:', error);
          reject(error);
        }
      )
    );
  }
  createChart(
    containerId: string,
    title: string,
    subtitle: string,
    rangeData: number,
    limit: number,
    unit: string
  ): Highcharts.Chart {
    // console.log("The value of max volume inside:",this.limit );

    const gaugeOptions: Highcharts.Options = {
      chart: {
        type: 'gauge',
        backgroundColor: 'transparent',
      },
      pane: {
        center: ['50%', '75%'],
        startAngle: -90,
        endAngle: 90,
        background: [
          {
            backgroundColor: '#006666',
            innerRadius: '90%',
            outerRadius: '100%',
            shape: 'arc',
            borderWidth: 5,
            borderColor: '#006666',
          },
        ],
        size: '100%',
      },
      yAxis: {
        min: this.min,
        max: limit,
        tickPixelInterval: 60,
        tickPosition: 'inside',
        tickColor: 'red',
        tickLength: 20,
        tickWidth: 2,
        minorTickInterval: 'auto',

        labels: {
          distance: 20,
          style: {
            fontSize: '14px',
          },
        },
        lineWidth: 0,
      },
      plotOptions: {
        solidgauge: {
          dataLabels: {
            y: 5,
            borderWidth: 0,
            useHTML: true,
          },
        },
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
    };

    return Highcharts.chart(
      containerId,
      Highcharts.merge(gaugeOptions, {
        title: {
          text: title,
          style: {
            fontFamily: 'sans-serif',
            fontSize: '21px',
          },
        },
        subtitle: {
          text: subtitle,
          style: {
            fontFamily: 'sans-serif',
            fontSize: '14px',
          },
        },

        yAxis: {
          min: 0,
          max: limit,
          title: {
            text: 'Data Received',
          },
        },

        credits: {
          enabled: false,
        },

        series: [
          {
            name: 'Speed',
            type: 'gauge',
            data: [rangeData],
            tooltip: {
              valueSuffix: this.rangeUnit,
            },
            dataLabels: {
              format: '{y} ' + this.rangeUnit,
              borderWidth: 3,
              color: 'black',
              style: {
                fontSize: '16px',
              },
            },
            dial: {
              radius: '80%',
              baseWidth: 12,
              baseLength: '0%',
              rearLength: '0%',
            },
            pivot: {
              backgroundColor: '#006666',
              radius: 10,
            },
          },
        ],
      })
    );
  }

  updateChartSpeed(rangeTotalData: number) {
    if (this.chartSpeed) {
      this.chartSpeed.series[0].setData([rangeTotalData], true);
    }
  }

  updateChartRpm(rangeSuccessData: number) {
    if (this.chartRpm) {
      this.chartRpm.series[0].setData([rangeSuccessData], true);
    }
  }

  convertSize(size: string): number {
    const [value, unit] = size.split(' ');

    let limit = parseFloat(value);
    return limit;
  }

  convertRange(size: string): string {
    const [value, unit] = size.split(' ');
    return unit;
  }

  convertSizeToKbs(size: string): number {
    const [value, unit] = size.split(' ');

    let kbs = parseFloat(value);
    if (unit === 'MB') {
      kbs *= 1024;
    } else if (!unit || unit === 'B') {
      kbs /= 1024;
    }
    return kbs;
  }

  onFileTypeSelected(event: any) {
    const selectedFileType = event.target.value;
    // Check if the selectedFileType is not "All" before filtering
    if (selectedFileType !== 'All') {
      this.filterByFileType(selectedFileType);
    } else {
      this.clearFilter();
    }
  }

  filterByFileType(fileType: string) {
    if (this.chartSpeed && this.chartRpm) {
      const currentDate = new Date();
      // Calculate the timestamp for 10 minutes ago
      const tenMinutesAgo = new Date(
        currentDate.getTime() - 2 * 120 * 1000
      ).toISOString();
      const filteredData = this.data.filter((item) => {
        return (
          item.FILE_TYPE === fileType && item.isotimestamp >= tenMinutesAgo
        );
      });
      // const filteredRecentData=this.data.filter(item => item.isotimestamp >= tenMinutesAgo);

      const totalVolume = this.calculateTotalVolume(filteredData);
      const successTotalVolume = this.calculateSuccessVolume(filteredData);

      this.updateChartSpeed(
        this.convertSize(this.calculateDataRate(totalVolume))
      );
      this.updateChartRpm(
        this.convertSize(this.calculateDataRate(successTotalVolume))
      );
    } else {
      console.error('chartSpeed or chartRpm is undefined.');
    }
  }

  clearFilter() {
    if (this.chartSpeed && this.chartRpm) {
      const currentDate = new Date();
      // Calculate the timestamp for 10 minutes ago
      const tenMinutesAgo = new Date(
        currentDate.getTime() - 2 * 120 * 1000
      ).toISOString();

      const recentData = this.data.filter(
        (item) => item.isotimestamp >= tenMinutesAgo
      );

      const totalVolume = this.calculateTotalVolume(recentData);
      const successTotalVolume = this.calculateSuccessVolume(recentData);

      this.updateChartSpeed(
        this.convertSize(this.calculateDataRate(totalVolume))
      );
      this.updateChartRpm(
        this.convertSize(this.calculateDataRate(successTotalVolume))
      );
    } else {
      console.error('chartSpeed or chartRpm is undefined.');
    }
  }
  calculateTotalVolume(data: any[]): number {
    const fileSizes = data.map((item) => item.FILE_SIZE);
    const totalVolume = fileSizes.reduce(
      (total, size) => total + this.convertSizeToKbs(size),
      0
    );
    return totalVolume;
  }

  calculateSuccessVolume(data: any[]): number {
    const successFilesData = data.filter((item) => item.STATUS === '200');
    const successFileSizes = successFilesData.map((item) => item.FILE_SIZE);
    return successFileSizes.reduce(
      (total, size) => total + this.convertSizeToKbs(size),
      0
    );
  }

  calculateDataRate(totalVolume: number): string {
    let result1 = Math.round(totalVolume / 60);

    let result: string;

    const totalVolumeMB = (result1 / 1024) * 8;
    result = totalVolumeMB.toFixed(2) + ' Mbps'; // Convert to MB and append MB for values >= 1024

    return result;
  }
}

// calculateDataRate(totalVolume: number):string {
//   // const currentDate = new Date();
//   // const midnight = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
//   // const secondsSinceMidnight = Math.floor((currentDate.getTime() - midnight.getTime()) / 1000);

//   // let result1 = Math.round((totalVolume / secondsSinceMidnight) * 100) / 100;

//  let result1 = Math.round((totalVolume / 600));

//   let result: string;
//   if (result1 <= 1024) {
//     result = result1.toFixed(2) + ' KB'; // Append KB for values <= 1024
//   } else {
//     const totalVolumeMB = result1 / 1024;
//     result = totalVolumeMB.toFixed(2) + ' MB'; // Convert to MB and append MB for values >= 1024
//   }
//   return result;
//     }}
