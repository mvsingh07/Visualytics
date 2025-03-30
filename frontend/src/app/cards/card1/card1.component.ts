import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RangeService } from 'src/app/range.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card1',
  templateUrl: './card1.component.html',
  styleUrls: ['./card1.component.scss'],
})
export class Card1Component implements OnInit {
  timeDifferenceInDays: number | null = null;
  totalFiles: number = 0;
  sucessFiles: number = 0;
  badRequests: number = 0;
  successFilesInRange: number = 0;
  totalValidFiles: number = 0;
  totalVolume!: number;
  totalVolumeInBytes: number = 0;
  finalVolume!: string;
  finalVolumeInRange!: string;
  totalVolumeInRange!: string;
  VolumeInMb: number = 0;
  successRate: number = 0;

  private intervalSubscription: Subscription | undefined;
  private selectedTimeRangeSubscription: Subscription | undefined;

  constructor(private http: HttpClient, private rangeService: RangeService) {}

  ngOnInit() {
    // Subscribe to selectedTimeRange$ observable
    this.selectedTimeRangeSubscription =
      this.rangeService.selectedTimeRange$.subscribe(
        ({ startDate, endDate }) => {
          if (startDate && endDate) {
            this.fetchRangeData(startDate, endDate);
          } else {
            this.fetchData();
          }
        }
      );
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.intervalSubscription) {
      this.intervalSubscription.unsubscribe();
    }
    if (this.selectedTimeRangeSubscription) {
      this.selectedTimeRangeSubscription.unsubscribe();
    }
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
    // console.log('Fetched Data:', data);
    const fileCounts = data.reduce((counts, item) => {
      const statusType = item.STATUS;
      counts[statusType] = counts[statusType] || { totalFiles: 0 };
      counts[statusType].totalFiles++;
      return counts;
    }, {});

    // console.log("Total processed:",fileCounts);

    // <-------------------For Time Range Calculation ---------------------------->

    const timestamps = data.map((item) => item.isotimestamp);
    const validTimestamps = timestamps
      .map((dateStr) => new Date(dateStr)) // Convert date strings to Date objects
      .filter((date) => date instanceof Date && !isNaN(date.getTime()))
      .map((date) => date.getTime());

    // here firstDate in data records is used as start Date and present date
    // is being used as endDate

    if (validTimestamps.length > 0) {
      // Calculate the minimum and maximum timestamps
      const minTimestamp = Math.min(...validTimestamps);
      // const isost = new Date(minTimestamp).toISOString();
      const st = new Date(minTimestamp).getTime();

      const maxTimestamp = Math.max(...validTimestamps);
      // const isoen = new Date(maxTimestamp).toISOString();
      const en = new Date(maxTimestamp).getTime();

      console.log('Earliest Timestamp:', st);
      // console.log('Latest Timestamp:', isoen);

      const currentDate = new Date();
      const cD = currentDate.getTime();
      // console.log('Latest Timestamp:', currentDate);
      const timeDifference = cD - st;

      console.log('Time Difference:', timeDifference);
      const timeDifferenceInDays = calcdiff(st, cD);
      this.timeDifferenceInDays = Math.abs(timeDifferenceInDays);
      // console.log("Time difference in days:", this.timeDifferenceInDays);
    } else {
      console.log('No valid timestamps found.');
      this.timeDifferenceInDays = 0; // Assign null if no valid timestamps are found
    }

    function calcdiff(st: number, en: number) {
      const milliseconds = en - st;
      const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

      console.log('value in  function:', days);
      if (days > 0) {
        return days;
      } else {
        return 1;
      }
    }
    // <-------------------For Time Range Calculation ---------------------------->\\

    this.sucessFiles = fileCounts['200'] ? fileCounts['200'].totalFiles : 0;

    this.successFilesInRange = Math.round(
      Number(this.sucessFiles / this.timeDifferenceInDays!)
    );
    this.badRequests =
      (fileCounts['400'] ? fileCounts['400'].totalFiles : 0) +
      (fileCounts['408'] ? fileCounts['408'].totalFiles : 0) +
      (fileCounts['401'] ? fileCounts['401'].totalFiles : 0);

    this.totalFiles = data.length;

    this.totalValidFiles = this.totalFiles - this.badRequests;

    this.successRate = (this.sucessFiles / this.totalValidFiles) * 100;

    const fileSizes = data.map((item) => item.FILE_SIZE);

    this.totalVolume = fileSizes.reduce(
      (total, size) => total + this.convertSizeToMegaBytes(size),
      0
    );

    this.finalVolume = this.convertSize(this.totalVolume);

    this.totalVolumeInRange = this.convertSize(
      Number(this.totalVolume / this.timeDifferenceInDays!)
    );

    this.finalVolumeInRange = this.convertSize(this.totalVolume);
    this.saveCalculatedStatsToMongoDB(); // Make sure should not be commented or removed from this function otherwise it is not going to save the data in mongodb
  }

  saveCalculatedStatsToMongoDB() {
    const calculatedData = {
      totalFiles: this.totalFiles,
      successFiles: this.sucessFiles,
      badRequests: this.badRequests,
      successRate: this.successRate,
      totalValidFiles: this.totalValidFiles,
      totalVolume: this.finalVolume,
      totalVolumeInRange: this.totalVolumeInRange,
      finalVolume: this.finalVolume,
      finalVolumeInRange: this.finalVolumeInRange,
      successFilesInRange: this.successFilesInRange,
      timeDifferenceInDays: this.timeDifferenceInDays,
    };

    //  Send data to backend API
    this.http
      .put('http://192.168.1.131:8021/api/spare-filestats', calculatedData)
      .subscribe(
        (response) => {
          console.log(' Spare File Stats saved:', response);
        },
        (error) => {
          console.error(' Error saving spare file stats:', error);
        }
      );
  }

  convertSizeToMegaBytes(size: string): number {
    const [value, unit] = size.split(' ');
    let megaBytes = parseFloat(value);

    if (unit === 'KB') {
      megaBytes /= 1024; // Convert KB to MB
    } else if (!unit || unit === 'B') {
      megaBytes /= 1024 * 1024; // Convert Bytes to MB
    }

    return megaBytes;
  }

  convertSize(size: number): string {
    // Parse the input string as a float
    const sizeInMB = size;

    let convertedValue: number;
    let unit: string;

    if (sizeInMB >= 1024) {
      // Convert to gigabytes (GB) if the size is larger than or equal to 1024 MB
      convertedValue = sizeInMB / 1024;
      unit = 'GB';
    } else if (sizeInMB >= 1024 * 1024) {
      // Convert to terabytes (TB) if the size is larger than or equal to 1,048,576 MB (1 TB)
      convertedValue = sizeInMB / (1024 * 1024);
      unit = 'TB';
    } else {
      // If the size is less than 1024 MB (1 GB), keep it in megabytes (MB)
      convertedValue = sizeInMB;
      unit = 'MB';
    }

    // Format the result as a string
    const formattedResult = `${convertedValue.toFixed(2)} ${unit}`;

    return formattedResult;
  }

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
}
