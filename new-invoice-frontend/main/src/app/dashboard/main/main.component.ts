import { Component, ViewChild } from '@angular/core';
import {
  ApexTitleSubtitle,
  ApexMarkers,
  ChartComponent,
  ApexAxisChartSeries,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexYAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexLegend,
  ApexFill,
  ApexResponsive,
  ApexGrid,
} from 'ng-apexcharts';
import { NgxGaugeType } from 'ngx-gauge/gauge/gauge';
import { dataSeries } from './chartdata';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';
import { Router } from '@angular/router';
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
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent {
  @ViewChild('chart') chart?: ChartComponent;
  public invoiceChartOptions: Partial<ChartOptions> | any;
  public columnChartOptions: Partial<ChartOptions> | any;

  gaugeType = 'arch' as NgxGaugeType;
  gaugeValue = 48;
  gaugeSize = 170;
  guageThick = 16;
  thresholdConfig = {
    0: { color: 'green' },
    40: { color: 'orange' },
    75.5: { color: 'red' },
  };

  gaugeType2 = 'arch' as NgxGaugeType;
  gaugeValue2 = 34;
  gaugeSize2 = 170;
  guageThick2 = 16;
  thresholdConfig2 = {
    0: { color: 'green' },
    40: { color: 'orange' },
    75.5: { color: 'red' },
  };

  pendingInvoices: any = [];
  rejectedInvoices: any = [];
  processedInvoices: any = [];

  constructor (private commonService: CommonService, private router: Router,) {
    this.getDashboardInvoice();
    this.monthlyInvoiceChart();
    this.monthlyHistoryChart();
  }

  async getDashboardInvoice() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_DASHBOARD_INVOICE);
    if (data.status) {
      this.pendingInvoices = data.data.pending_invoices;
      this.rejectedInvoices = data.data.cancelled_invoices;
      this.processedInvoices = data.data.process_invoices;
    }
  }

  monthlyInvoiceChart() {
    this.invoiceChartOptions = {
      chart: {
        height: 350,
        type: 'line',
        dropShadow: {
          enabled: false,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 1,
        },
        toolbar: {
          show: false,
        },
        foreColor: '#9aa0ac',
      },
      dataLabels: {
        enabled: true,
      },
      stroke: {
        curve: 'smooth',
      },
      series: [
        {
          name: 'Pending Invoice',
          data: [28, 29, 33],
          color: '#C5B7FF',
        },
        {
          name: 'Approved Invoice',
          data: [12, 11, 14],
          color: '#94D4FE',
        },
        {
          name: 'Rejected Invoice',
          data: [2, 5, 1],
          color: '#FF99B1',
        },
      ],
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5,
        },
      },
      markers: {
        size: 6,
      },
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
        title: {
          text: 'Temperature',
        },
        labels: {
          style: {
            colors: ['#9aa0ac'],
          },
        },
        min: 5,
        max: 40,
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
      tooltip: {
        theme: 'dark',
        marker: {
          show: true,
        },
        x: {
          show: true,
        },
      },
    };
  }

  monthlyHistoryChart() {
    this.columnChartOptions = {
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
          data: [44, 55, 41],
          color: '#008FFB',
        },
        {
          name: 'On Hold',
          data: [13, 23, 20],
          color: '#E1E0E0',
        },
        {
          name: 'Decline',
          data: [11, 17, 15],
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
      fill: {
        opacity: 1,
      },
      dataLabels: {
        enabled: false,
      },
    };
  }

  viewMonthlyInvoiceChart() {
    this.router.navigate([WEB_ROUTES.DASHBOARD_MONTHLY_INVOICE]);
  }

  downloadMonthlyInvoiceChart() {
    //
  }

  printMonthlyInvoiceChart() {
    //
  }

  viewHistoryChart() {
    this.router.navigate([WEB_ROUTES.DASHBOARD_MONTHLY_HISTORY]);
  }

  downloadHistoryChart() {
    //
  }

  printHistoryChart() {
    //
  }

  invoiceDetail(invoice: any) {
    this.router.navigate([WEB_ROUTES.INVOICE_DETAILS]);
  }

  viewInvoice(type: string) {
    this.router.navigate([WEB_ROUTES.INVOICE], { queryParams: { type: type } });
  }
}
