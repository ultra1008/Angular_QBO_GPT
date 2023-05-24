import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as ApexCharts from 'apexcharts';
import { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexXAxis, ApexFill, ApexTooltip, ApexStroke, ApexLegend, ApexTitleSubtitle, ApexGrid, ApexMarkers, ApexResponsive } from 'ng-apexcharts';
import { WEB_ROUTES } from 'src/consts/routes';
import { saveAs } from 'file-saver';

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
      legend: {
        position: 'bottom',
        horizontalAlign: 'center',
      },
    };
  }

  downloadHistoryChart() {
    const chart = new ApexCharts(document.querySelector("#chart"), this.invoiceChartOptions);
    chart.render().then(() => {
      window.setTimeout(function () {
        chart.dataURI().then((uri: any) => {
          console.log(uri.imgURI);
          const downloadLink = document.createElement('a');
          const fileName = 'Monthly Invoice Chart.png';

          downloadLink.href = uri.imgURI;
          downloadLink.download = fileName;
          downloadLink.click();
          // downloadLink.remove();
          /*  window.setTimeout(function () {
              // downloadLink.remove();
            }, 1000); */

          /*  const blob = new Blob([uri.imgURI], { type: "image/png" });
           console.log(blob); 
 
           saveAs(blob, 'attachment'); */
          /* const img = new Image();
          img.src = uri.imgURI;

          const winparams =
            "dependent=yes,locationbar=no,scrollbars=yes,menubar=yes," +
            "resizable,screenX=50,screenY=50,width=850,height=1050";

          const htmlPop =
            "<embed width=100% height=100%" +
            ' type="image/png"' +
            ' src="' +
            uri.imgURI +
            '" ' +
            '"></embed>';

          this.printWindow = window.open("", "PDF", winparams);
          this.printWindow.document.write(htmlPop);
          this.printWindow.print();
          this.loadingBuffer = false; */
        });
      }, 2500);
    });



    /* const chart = new ApexCharts(document.querySelector("#chart"), this.invoiceChartOptions);
    chart.render().then(() => {
      window.setTimeout(function () {
        chart.dataURI().then((uri: any) => {
          // console.log(uri.imgURI);
          const downloadLink = document.createElement('a');
          const fileName = 'Monthly Invoice Chart.png';

          downloadLink.href = uri.imgURI;
          downloadLink.download = fileName;

          downloadLink.click();
          window.setTimeout(function () {
            document.body.removeChild(downloadLink);
          }, 1000);
        });
      }, 1500);
    }); */
  }

  async printHistoryChart() {
    /* console.log(window.ApexCharts._chartInstances);
    const chartInstance = window.ApexCharts._chartInstances.find(
      (chart: any) => chart.id === 'chart'
    );

    const base64 = await chartInstance.chart.dataURI();
    const downloadLink = document.createElement("a");  
    downloadLink.href = base64.imgURI;
    downloadLink.download = "image.png";

    // Add the anchor element to the document
    document.body.appendChild(downloadLink);

    // Simulate a click event to initiate the download
    downloadLink.click();

    // Remove the anchor element from the document
    document.body.removeChild(downloadLink); */
    const chart = new ApexCharts(document.querySelector("#chart"), this.invoiceChartOptions);
    chart.render().then(() => {
      window.setTimeout(function () {
        chart.dataURI().then((uri: any) => {
          console.log(uri.imgURI);
        });
      }, 1000);
    });
    /* const chart = new ApexCharts(document.querySelector("#chart"), this.invoiceChartOptions);
    chart.render().then(() => {
      chart.dataURI().then((uri: any) => {  // Here shows an error
        console.log(uri);
        const downloadLink = document.createElement('a');
        const fileName = 'sample.png';

        downloadLink.href = uri.imgURI;
        downloadLink.download = fileName;
        downloadLink.click(); 
      });
    }); */
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
