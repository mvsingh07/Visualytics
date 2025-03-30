import { Component, ElementRef, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts/highcharts';
import SolidGauge from 'highcharts/modules/solid-gauge';
import HighchartsGauge from 'highcharts/highcharts-more';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsExportData from 'highcharts/modules/export-data';
import { HttpClient } from '@angular/common/http';

SolidGauge(Highcharts); HighchartsGauge(Highcharts);
@Component({
  selector: 'app-exp2',
  templateUrl: './exp2.component.html',
  styleUrls: ['./exp2.component.scss']
})
export class Exp2Component implements OnInit {
  chartOptions: any = {}; // Declare chartOptions property
  Highcharts = Highcharts;

  constructor(private http: HttpClient, private elementRef: ElementRef) { }
  gaugeOptions: {
    chart: { type: string; }; title: {
      text:string
    }; pane: { center: string[]; size: string; startAngle: number; endAngle: number; background: { backgroundColor: string ; innerRadius: string; outerRadius: string; shape: string; }; }; exporting: { enabled: boolean; }; tooltip: { enabled: boolean; };
    // the value axis
    yAxis: { stops: (string | number)[][]; lineWidth: number; tickWidth: number; minorTickInterval: null; tickAmount: number; title: { y: number; }; labels: { y: number; }; }; plotOptions: { solidgauge: { dataLabels: { y: number; borderWidth: number; useHTML: boolean; }; }; };
  } | undefined;
  ngOnInit() {
    

    // Highcharts gauge options
    const gaugeOptions: Highcharts.Options = {
      // Your gauge options here
      chart: {
        type: 'solidgauge'
    },

    title: {
      text:"Speed"
    },

    pane: {
      center: ['50%', '85%'],
      size: '140%',
      startAngle: -90,
      endAngle: 90,
      background: [{
        backgroundColor: '#EEE',
        innerRadius: '60%',
        outerRadius: '100%',
        shape: 'arc'
      }]
    },

    exporting: {
        enabled: false
    },

    tooltip: {
        enabled: false
    },

    // the value axis
    yAxis: {
        stops: [
            [0.1, '#55BF3B'], // green
            [0.5, '#DDDF0D'], // yellow
            [0.9, '#DF5353'] // red
        ],
        lineWidth: 0,
        tickWidth: 0,
        minorTickInterval: 'auto',
        tickAmount: 2,
        title: {
            y: -70
        },
        labels: {
            y: 16
        }
    },

    plotOptions: {
        solidgauge: {
            dataLabels: {
                y: 5,
                borderWidth: 0,
                useHTML: true
            }
        }
    }

      
    };

    // The speed gauge
    const chartSpeed = Highcharts.chart('container-speed', Highcharts.merge(gaugeOptions, {
      // Speed gauge configuration
      yAxis: {
        min: 0,
        max: 200,
        title: {
            text: 'Speed'
        }
    },

    credits: {
        enabled: false
    },

    series: [{
        name: 'Speed',
        data: [80],
        dataLabels: {
            format:
                '<div style="text-align:center">' +
                '<span style="font-size:25px">{y}</span><br/>' +
                '<span style="font-size:12px;opacity:0.4">km/h</span>' +
                '</div>'
        },
        tooltip: {
            valueSuffix: ' km/h'
        }
    }]


    }));

    // The RPM gauge
    const chartRpm = Highcharts.chart('container-rpm', Highcharts.merge(gaugeOptions, {
      // RPM gauge configuration
      yAxis: {
        min: 0,
        max: 5,
        title: {
            text: 'RPM'
        }
    },

    series: [{
        name: 'RPM',
        data: [1],
        dataLabels: {
            format:
                '<div style="text-align:center">' +
                '<span style="font-size:25px">{y:.1f}</span><br/>' +
                '<span style="font-size:12px;opacity:0.4">' +
                '* 1000 / min' +
                '</span>' +
                '</div>'
        },
        tooltip: {
            valueSuffix: ' revolutions/min'
        }
    }]

    }));

    // Bring life to the dials
//     setInterval(() => {
//       // Update gauges' values
//       let point,
//       newVal,
//       inc;
//       if (chartSpeed) {
//         // Update speed gauge
//         if (chartSpeed) {
//             point = chartSpeed.series[0].points[0];
//             inc = Math.round((Math.random() - 0.5) * 100);
//             newVal = point.y + inc;
    
//             if (newVal < 0 || newVal > 200) {
//                 newVal = point.y - inc;
//             }
    
//             point.update(newVal);
//       }
//       if (chartRpm) {
//         point = chartRpm.series[0].points[0];
//         inc = Math.random() - 0.5;
//         newVal = point.y + inc;

//         if (newVal < 0 || newVal > 5) {
//             newVal = point.y - inc;
//         }

//         point.update(newVal);
//     }
// }, 2000);

    // Create chart
    // Highcharts.chart(this.elementRef.nativeElement.querySelector('#chartContainer'), this.chartOptions);
  }

  convertSizeToKbs(size: string): number {
    const [value, unit] = size.split(' ');
    let kbs = parseFloat(value);

    if (unit === 'KB') {
      kbs = kbs;
    } else if (unit === 'MB') {
      kbs *= 1024;
    }
    return kbs;
  }
}
