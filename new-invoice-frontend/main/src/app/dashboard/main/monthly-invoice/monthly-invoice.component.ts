import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as ApexCharts from 'apexcharts';
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
  selector: 'app-monthly-invoice',
  templateUrl: './monthly-invoice.component.html',
  styleUrls: ['./monthly-invoice.component.scss']
})
export class MonthlyInvoiceComponent {
  public invoiceChartOptions: Partial<ChartOptions> | any;
  chartdiv: HTMLElement | any;
  printWindow: Window | any;

  constructor (private router: Router, public translate: TranslateService, private _sanitizer: DomSanitizer) {
    this.monthlyInvoiceChart();
  }

  monthlyInvoiceChart() {
    this.invoiceChartOptions = {
      chart: {
        height: 650,
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
          show: true,
          tools: {
            zoom: false,
            zoomin: false,
            zoomout: false,
            reset: false,
            pan: false, print: true,
            /* download: '<div style="background-color:red"><img src="../../assets/images/icons/download.svg" class="ico-download" width="20"></div>',
            customIcons: [{
              icon: '<img src="../../assets/images/icons/download.svg" class="ico-download" width="20">',
              index: 0,
              title: 'tooltip of the icon',
              class: 'custom-icon',
              click: function () {
                console.log('clicked');
              }
            } ],*/
            export: {
              /* svg: {
                filename: 'chart.svg'
              },
              png: {
                filename: 'chart.png'
              } */
              /* csv?: {
                filename?: undefined | string;
                columnDelimiter?: string;
                headerCategory?: string;
                headerValue?: string;
                dateFormatter?(timestamp?: number): any;
            };
            svg?: {
                filename?: undefined | string;
            };
            png?: {
                filename?: undefined | string;
            }; */
            }
          },
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
          data: [28, 29, 33, 36, 32, 32, 33, 12, 11, 14, 36, 24],
          color: '#C5B7FF',
        },
        {
          name: 'Approved Invoice',
          data: [12, 11, 14, 18, 17, 13, 13, 20, 51, 19, 16, 12],
          color: '#94D4FE',
        },
        {
          name: 'Rejected Invoice',
          data: [21, 15, 13, 61, 28, 33, 23, 28, 29, 33, 36, 32],
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
        title: {
          text: 'Invoice',
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

  downloadHistoryChart() {
    //
  }

  printHistoryChart() {
    const chart = new ApexCharts(document.querySelector("#chart"), this.invoiceChartOptions);
    chart.render().then(() => {
      chart.dataURI().then((uri: any) => {  // Here shows an error
        console.log(uri);
        const downloadLink = document.createElement('a');
        const fileName = 'sample.png';

        downloadLink.href = uri.imgURI;
        downloadLink.download = fileName;
        downloadLink.click();
        // this._sanitizer.bypassSecurityTrustResourceUrl(uri);
        /*  const pdf = new jsPDF();
         pdf.addImage(uri, 'PNG', 0, 0);
         pdf.save("download.pdf"); */
      });
    });
  }
  /* this.chartdiv = document.getElementById("chartdiv");
  this.chartdiv.style.display = "block";
  this.chartdiv.classList.add("modal-chart");

  domtoimage
    .toPng(this.chartdiv)
    .then(function (dataUrl: any) {
      const img = new Image();
      img.src = dataUrl;

      const winparams =
        "dependent=yes,locationbar=no,scrollbars=yes,menubar=yes," +
        "resizable,screenX=50,screenY=50,width=850,height=1050";

      const htmlPop =
        "<embed width=100% height=100%" +
        ' type="image/png"' +
        ' src="' +
        dataUrl +
        '" ' +
        '"></embed>';

      this.printWindow = window.open("", "PDF", winparams);
      this.printWindow.document.write(htmlPop);
      this.printWindow.print();
      this.loadingBuffer = false;
    })

    .catch(function () {
      this.loadingBuffer = false;
      // console.error('oops, something went wrong!', error);
    });
} */

  back() {
    this.router.navigate([WEB_ROUTES.DASHBOARD]);
  }
}
