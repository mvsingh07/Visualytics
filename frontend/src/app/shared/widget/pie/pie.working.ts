import { Component, OnInit,Input, ElementRef, ViewChild } from '@angular/core';
import * as Highcharts from 'highcharts';
import { FormGroup, FormControl} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';
import { RangeService } from 'src/app/range.service';
import { LightModeHighchartsThemeComponent } from '../../themes/light-mode-highcharts-theme/light-mode-highcharts-theme.component';
import { ThemeService } from 'src/app/theme.service';
@Component({
  selector: 'app-widget-pie',
  templateUrl: './pie.component.html',
  styleUrls: ['./pie.component.scss'],
  standalone: true,
  imports: [
    HighchartsChartModule
  ],
})
export class PieComponent implements OnInit{
  chartOptions: any = {};
  Highcharts = Highcharts;
 currentEndDate = new Date();
 currentStartDate = new Date(2023, 5, 1);
  @Input() options: any;
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
    
  });

  selectedRange: any
  constructor(private http: HttpClient,private themeService: ThemeService,private rangeService:RangeService, private elementRef: ElementRef) {
    this.range.valueChanges.subscribe((value) => {
      this.selectedRange = { ...value };
    });
  }
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


  processData(data: any[]) {
    const fileCounts: { [key: string]: { totalFiles: number; totalSize: number } } = data.reduce(
      (counts, item) => {
        const fileType = item.FILE_TYPE;
        const fileSize = this.convertSizeToBytes(item.FILE_SIZE); // Convert FILE_SIZE to bytes
        counts[fileType] = counts[fileType] || { totalFiles: 0, totalSize: 0 };
        counts[fileType].totalFiles++;
        counts[fileType].totalSize += fileSize;
        return counts;
      },
      {}
    );
    console.log("Count for each fileType:", fileCounts);
  
    const totalVolume = Object.values(fileCounts).reduce((total, fileType) => total + fileType.totalSize, 0);
  
    const sortedFileTypes = Object.keys(fileCounts).sort((a, b) => fileCounts[b].totalSize - fileCounts[a].totalSize);
  
    const maxFileTypes = 5; // Maximum number of file types to display individually
    const topFileTypes = sortedFileTypes.slice(0, maxFileTypes);
    const otherFileTypes = sortedFileTypes.slice(maxFileTypes);
    

    console.log("Topppppp",topFileTypes)

    console.log("Otherrrr",otherFileTypes)
    let otherTotalSize = 0;
  
    const chartData: {
      name: string;
      y: number;
      volume: string;
      averageSize: string;
      includedFileTypes?: string;
    }[] = topFileTypes.map((fileType) => {
      const size = fileCounts[fileType].totalSize;
      
      const percentage = (size / totalVolume) * 100;
  
      return {
        name: fileType,
        y: percentage,
        volume: this.formatSize(size),
        averageSize: this.calculateAverageSize(fileType, size, data),
      };
    });
  
    otherFileTypes.forEach((fileType) => {
      const size = fileCounts[fileType].totalSize;
      otherTotalSize += size;
    });
  
    console.log(",,sdcdp",otherTotalSize)
    
  
    if (otherFileTypes.length > 0) {
      const otherAverageSize = otherTotalSize / Object.values(fileCounts).reduce((total, fileType) => total + fileType.totalFiles, 0);
         
      console.log("ppp",otherAverageSize)

      chartData.push({
        name: 'Others',
        y: (otherTotalSize / totalVolume) * 100,
        volume: this.formatSize(otherTotalSize),
        averageSize: this.formatSize(otherAverageSize),
        includedFileTypes: otherFileTypes.join(', '),
      });
    }
  
    console.log("Processed Data:", chartData);
  
  
      this.chartOptions = {

      
        chart: {
          type: 'pie',
          // plotBackgroundColor: null,
          // plotBorderWidth: 0,
          // plotShadow: false,
         
        },
        title: {
          text: 'Volume of Data',
          align: 'left',
          style: {
            fontSize: '24px',
            fontWeight: 'bold',
            
          },
        },
        subtitle: {
          text: `Total Volume: ${this.formatSize(totalVolume)}`,
          align: 'left',
          style: {
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'grey',
          },
        },
        credits: {
          enabled: false,
        },
        tooltip: {
          pointFormat: ' ({point.percentage:.1f}%)<br/>Volume: {point.volume}<br/>Average File Size: {point.averageSize}'
        },
        plotOptions: {


          pie: {
            colors: ["rgb(31, 67, 122)"],
            color:'rgb(25,54,98)',
            dataLabels: {
              enabled: true,
              distance: -10,
              style: {
                fontWeight: 'bold',
                color: 'white',
              },
            },
            startAngle: -90,
            endAngle: 90,
            center: ['50%', '95%'],
            size: '150%',
            showInLegend: true,
          },
        },
     
        series: [
          {
  
            type: 'pie',
            name: 'File Types',
            innerSize: '50%',
            data: chartData,
           
          },
        ],
       
        legend: {
          align: 'left',
          verticalAlign: 'bottom',
          layout: 'horizontal',
          itemMarginBottom: -4,
          title: {
            text: `Average File Size: ${this.calculateAverageFileSize(data)}<br>`,
            style: {
              color: 'grey',
            },
          
            

          },
        },
      };

      setTimeout(() => {
        Highcharts.chart(this.elementRef.nativeElement.querySelector('#chartContainer'), this.chartOptions);
      }, 0);
    };
  


  convertSizeToBytes(size: string): number {
    const [value, unit] = size.split(' ');
    let bytes = parseFloat(value);

    if (unit === 'KB') {
      bytes *= 1024;
    } else if (unit === 'MB') {
      bytes *= 1024 * 1024;
    }
    return bytes;
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes.toFixed(2)} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }

  calculateAverageSize(fileType: string, size: number, data: any[]): string {
    const fileData = data.filter((item) => item.FILE_TYPE === fileType);
    const totalFiles = fileData.length;

    if (totalFiles === 0) {
      return 'N/A';
    }
    const averageSize = size / totalFiles;
    return this.formatSize(averageSize);
  }

  calculateAverageFileSize(data: any[]): string {
    const totalSize = data.reduce((total, item) => total + this.convertSizeToBytes(item.FILE_SIZE), 0);
    const totalFiles = data.length;

    if (totalFiles === 0) {
      return 'N/A';
    }

    const averageSize = totalSize / totalFiles;
    return this.formatSize(averageSize);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

}
