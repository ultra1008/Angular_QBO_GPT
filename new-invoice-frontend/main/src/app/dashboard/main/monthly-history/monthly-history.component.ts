import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexXAxis, ApexFill, ApexTooltip, ApexStroke, ApexLegend, ApexTitleSubtitle, ApexGrid, ApexMarkers, ApexResponsive } from 'ng-apexcharts';
import { WEB_ROUTES } from 'src/consts/routes';
export type ChartOptions = {
  series?: ApexAxisChartSeries;
  series2?: ApexNonAxisChartSeries;
  chart?: ApexChart;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  yaxis?: ApexYAxis;
  xaxis?: ApexXAxis;
  fill?: ApexFill;
  tooltip?: ApexTooltip;
  stroke?: ApexStroke;
  legend?: ApexLegend;
  title?: ApexTitleSubtitle;
  colors?: string[];
  grid?: ApexGrid;
  markers?: ApexMarkers;
  labels: string[];
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-monthly-history',
  templateUrl: './monthly-history.component.html',
  styleUrls: ['./monthly-history.component.scss']
})
export class MonthlyHistoryComponent {
  public columnChartOptions: Partial<ChartOptions> | any;

  constructor (private router: Router, public translate: TranslateService) {
    this.monthlyHistoryChart();
  }

  monthlyHistoryChart() {
    this.columnChartOptions = {
      chart: {
        height: 650,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        foreColor: '#9aa0ac',
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            legend: {
              position: 'bottom',
              offsetX: -5,
              offsetY: 0,
            },
          },
        },
      ],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '180%',
        },
      },
      series: [
        {
          name: 'Paid',
          data: [44, 55, 41, 11, 17, 15, 13, 23, 20, 11, 17, 15],
          color: '#008FFB',
        },
        {
          name: 'On Hold',
          data: [13, 23, 20, 44, 55, 41, 11, 17, 15, 44, 55, 41],
          color: '#E1E0E0',
        },
        {
          name: 'Decline',
          data: [11, 17, 15, 13, 23, 20, 44, 55, 41, 13, 23, 20],
          color: '#F44336',
        },
      ],
      xaxis: {
        categories: ['June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
        title: {
          text: 'Month',
        },
        labels: {
          style: {
            colors: '#9aa0ac',
          },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: ['#9aa0ac'],
          },
        },
      },
      legend: {
        position: 'bottom',
        offsetY: 0,
      },
      fill: {
        opacity: 1,
      },
      dataLabels: {
        enabled: false,
      },
    };
  }

  viewHistoryChart() {
    // this.router.navigate([WEB_ROUTES.DASHBOARD_MONTHLY_HISTORY]);
  }

  downloadHistoryChart() {
    //
  }

  printHistoryChart() {
    //
  }

  back() {
    this.router.navigate([WEB_ROUTES.DASHBOARD]);
  }
}
