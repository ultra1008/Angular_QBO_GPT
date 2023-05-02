import { Component } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-chartjs',
  templateUrl: './chartjs.component.html',
  styleUrls: ['./chartjs.component.scss'],
})
export class ChartjsComponent {
  breadscrums = [
    {
      title: 'Chartjs',
      items: ['Charts'],
      active: 'Chartjs',
    },
  ];
  constructor() {
    //constructor
  }

  // Line chert start

  public lineChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        label: 'Foods',
        data: [0, 30, 10, 120, 50, 63, 10],
        backgroundColor: 'transparent',
        borderColor: '#222222',
        borderWidth: 2,
        fill: false,
        tension: 0.5,
        pointStyle: 'circle',
        pointRadius: 3,
        pointBorderColor: 'transparent',
        pointBackgroundColor: '#222222',
      },
      {
        label: 'Electronics',
        data: [0, 50, 40, 80, 40, 79, 120],
        backgroundColor: 'transparent',
        borderColor: '#f96332',
        borderWidth: 2,
        fill: false,
        tension: 0.5,
        pointStyle: 'circle',
        pointRadius: 3,
        pointBorderColor: 'transparent',
        pointBackgroundColor: '#f96332',
      },
    ],
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  };

  public lineChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5,
      },
    },
    scales: {
      y: {
        position: 'left',
        ticks: {
          color: '#9aa0ac', // Font Color
        },
      },
      x: {
        ticks: {
          color: '#9aa0ac', // Font Color
        },
      },
    },

    plugins: {
      legend: { display: true },
    },
  };

  public lineChartType: ChartType = 'line';

  // Line chart end

  // Area chart start

  public areaChartData: ChartConfiguration['data'] = {
    datasets: [
      {
        label: 'Foods',
        data: [0, 105, 190, 140, 270],
        borderWidth: 2,
        pointStyle: 'circle',
        pointRadius: 3,
        pointBorderColor: 'transparent',
        fill: 'origin',
      },
      {
        label: 'Electronics',
        data: [0, 152, 80, 250, 190],
        borderWidth: 2,
        pointStyle: 'circle',
        pointRadius: 3,
        pointBorderColor: 'transparent',
        fill: 'origin',
      },
    ],
    labels: ['January', 'February', 'March', 'April', 'May'],
  };

  public areaChartOptions: ChartConfiguration['options'] = {
    elements: {
      line: {
        tension: 0.5,
      },
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      y: {
        position: 'left',
        ticks: {
          color: '#9aa0ac', // Font Color
        },
      },
      x: {
        ticks: {
          color: '#9aa0ac', // Font Color
        },
      },
    },

    plugins: {
      legend: { display: true },
    },
  };

  public areaChartType: ChartType = 'line';

  // area chart end

  // bar chart start
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          color: '#9aa0ac', // Font Color
        },
      },
      y: {
        ticks: {
          color: '#9aa0ac', // Font Color
        },
        min: 10,
      },
    },
    plugins: {
      legend: {
        display: true,
      },
    },
  };
  public barChartType: ChartType = 'bar';
  public barChartPlugins = [];

  public barChartData: ChartData<'bar'> = {
    labels: ['2006', '2007', '2008', '2009', '2010', '2011', '2012'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        label: 'Series A',
        backgroundColor: 'rgba(109, 144, 232, 0.8)',
      },
      {
        data: [28, 48, 40, 19, 86, 27, 90],
        label: 'Series B',
        backgroundColor: 'rgba(255, 140, 96, 0.8)',
      },
    ],
  };

  // bar chart end

  // // start radar chart

  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };
  public radarChartLabels: string[] = [
    'A1',
    'A2',
    'A3',
    'A4',
    'A5',
    'A6',
    'A7',
  ];

  public radarChartData: ChartData<'radar'> = {
    labels: this.radarChartLabels,
    datasets: [
      {
        data: [58, 60, 74, 78, 55, 64, 42],
        label: 'Series A',
      },
      {
        data: [30, 45, 51, 22, 79, 35, 82],
        label: 'Series B',
      },
    ],
  };
  public radarChartType: ChartType = 'radar';

  // end radar chart

  // Doughnut chart start

  public doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };
  public doughnutChartLabels: string[] = [
    'Download Sales',
    'In-Store Sales',
    'Mail-Order Sales',
  ];
  public doughnutChartData: ChartData<'doughnut'> = {
    labels: this.doughnutChartLabels,
    datasets: [
      {
        data: [350, 450, 100],
        backgroundColor: ['#60A3F6', '#7C59E7', '#DD6811'],
      },
      {
        data: [50, 150, 120],
        backgroundColor: ['#60A3F6', '#7C59E7', '#DD6811'],
      },
      {
        data: [250, 130, 70],
        backgroundColor: ['#60A3F6', '#7C59E7', '#DD6811'],
      },
    ],
  };
  public doughnutChartType: ChartType = 'doughnut';

  // Doughnut chart end

  // // Bubble chart start

  public bubbleChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: {
      x: {
        ticks: {
          color: '#9aa0ac', // Font Color
        },
      },
      y: {
        ticks: {
          color: '#9aa0ac', // Font Color
        },
      },
    },
  };
  public bubbleChartType: ChartType = 'bubble';
  public bubbleChartLegend = true;

  public bubbleChartData: ChartData<'bubble'> = {
    labels: [],
    datasets: [
      {
        data: [
          { x: 45, y: 150000, r: 22.22 },
          { x: 42, y: 110000, r: 33.0 },
          { x: 60, y: 80637, r: 15.22 },
          { x: 75, y: 195055, r: 21.5 },
          { x: 30, y: 160446, r: 35.67 },
          { x: 25, y: 80446, r: 25.67 },
          { x: 10, y: 228446, r: 30.32 },
        ],
        label: 'Series A',
        // backgroundColor: [
        //   "red",
        //   "green",
        //   "blue",
        //   "purple",
        //   "yellow",
        //   "brown",
        //   "magenta",
        //   "cyan",
        //   "orange",
        //   "pink",
        // ],
        // borderColor: "blue",
        // hoverBackgroundColor: "purple",
        // hoverBorderColor: "red",
      },
    ],
  };
  // // Bubble chart end

  // Polar chart start

  public polarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
  };

  public polarAreaChartLabels: string[] = [
    'Project 1',
    'Project 2',
    'Project 3',
    'Project 4',
  ];
  public polarAreaChartData: ChartData<'polarArea'> = {
    labels: this.polarAreaChartLabels,
    datasets: [
      {
        data: [15, 18, 9, 19],
        label: 'Series 1',
        backgroundColor: ['#60A3F6', '#7C59E7', '#DD6811', '#5BCFA5'],
      },
    ],
  };
  public polarAreaLegend = true;

  public polarAreaChartType: ChartType = 'polarArea';
  // Polar chart end

  public pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [['Download'], ['Store'], 'Mail'],
    datasets: [
      {
        data: [300, 500, 100],
        backgroundColor: ['#60A3F6', '#7C59E7', '#DD6811', '#5BCFA5'],
      },
    ],
  };
  public pieChartType: ChartType = 'pie';

  // pie chart end
}
