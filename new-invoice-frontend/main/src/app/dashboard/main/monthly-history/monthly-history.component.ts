import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexXAxis, ApexFill, ApexTooltip, ApexStroke, ApexLegend, ApexTitleSubtitle, ApexGrid, ApexMarkers, ApexResponsive } from 'ng-apexcharts';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
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

const historyColors = ['#008FFB', '#E1E0E0', '#F44336'];

@Component({
  selector: 'app-monthly-history',
  templateUrl: './monthly-history.component.html',
  styleUrls: ['./monthly-history.component.scss']
})
export class MonthlyHistoryComponent {
  showHistoryChart = true;
  public historyChartOptions: Partial<ChartOptions> = {
    chart: {
      height: 350,
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
    series: [
      {
        name: 'Paid',
        data: [0, 0, 0],
        color: '#008FFB',
      },
      {
        name: 'On Hold',
        data: [0, 0, 0],
        color: '#E1E0E0',
      },
      {
        name: 'Rejected',
        data: [0, 0, 0],
        color: '#F44336',
      },
    ],
    xaxis: {
      categories: ['Mar', 'Apr', 'May'],
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
    dataLabels: {
      enabled: false,
    },
  };

  constructor (private router: Router, public translate: TranslateService, private commonService: CommonService) {
    this.monthlyHistoryChart();
  }

  async monthlyHistoryChart() {
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DASHBOARD_MONTHLY_HISTORY_CHART, { data_type: 'all' });
    if (data.status) {
      this.historyChartOptions.xaxis!.categories = data.month;
      const series = [];
      for (let i = 0; i < data.data.length; i++) {
        series.push({
          name: data.data[i].status,
          data: data.data[i].data,
          color: historyColors[i],
        });
      }
      this.historyChartOptions.series = series;
      this.showHistoryChart = false;
      setTimeout(() => {
        this.showHistoryChart = true;
      }, 100);
    }
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
