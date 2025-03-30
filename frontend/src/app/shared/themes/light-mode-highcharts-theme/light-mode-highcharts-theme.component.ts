import { Component } from '@angular/core';

@Component({
  selector: 'app-light-mode-highcharts-theme',
  templateUrl: './light-mode-highcharts-theme.component.html',
  styleUrls: ['./light-mode-highcharts-theme.component.scss']
})
export class LightModeHighchartsThemeComponent{
  public options = {
    colors: ['#7cb5ec', '#f7a35c', '#90ee7e', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee', '#55BF3B', '#DF5353', '#7798BF'],

    chart: {
      backgroundColor: 'white', // Set the background color for charts
      style: {
        fontFamily: 'Arial, sans-serif', // Set the default font family
      },
    },

    title: {
      style: {
        color: '#333', // Title text color
      },
    },

    subtitle: {
      style: {
        color: '#666', // Subtitle text color
      },
    },

    xAxis: {
      labels: {
        style: {
          color: '#333', // X-axis label text color
        },
      },
      title: {
        style: {
          color: '#333', // X-axis title text color
        },
      },
    },

    yAxis: {
      labels: {
        style: {
          color: '#333', // Y-axis label text color
        },
      },
      title: {
        style: {
          color: '#333', // Y-axis title text color
        },
      },
    },

    legend: {
      itemStyle: {
        color: '#333', // Legend item text color
      },
      itemHoverStyle: {
        color: '#000', // Legend item hover text color
      },
    },

    plotOptions: {
      series: {
        dataLabels: {
          color: '#333', // Data label text color
        },
        marker: {
          lineColor: '#333', // Marker border color
        },
      },
    },

    credits: {
      style: {
        color: '#666', // Credits text color
      },
    },

    navigation: {
      buttonOptions: {
        theme: {
          stroke: '#333', // Navigation button border color
        },
      },
    },
  };
}
