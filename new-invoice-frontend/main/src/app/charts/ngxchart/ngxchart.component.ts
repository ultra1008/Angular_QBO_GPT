import { Component } from '@angular/core';
import * as shape from 'd3-shape';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { LegendPosition } from '@swimlane/ngx-charts';
@Component({
  selector: 'app-ngxchart',
  templateUrl: './ngxchart.component.html',
  styleUrls: ['./ngxchart.component.scss'],
})
export class NgxchartComponent {
  breadscrums = [
    {
      title: 'ngxChart',
      items: ['Charts'],
      active: 'ngxChart',
    },
  ];

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = false;
  showXAxisLabel = true;
  showYAxisLabel = true;
  public legendPosition: LegendPosition = LegendPosition.Right;
  timeline = true;
  colorScheme: Color = {
    domain: ['#9370DB', '#87CEFA', '#FA8072', '#FF7F50', '#90EE90', '#9370DB'],
    group: ScaleType.Ordinal,
    selectable: true,
    name: 'Customer Usage',
  };
  showLabels = true;
  // data goes here
  public single = [
    {
      name: 'China',
      value: 2243772,
    },
    {
      name: 'USA',
      value: 1826000,
    },
    {
      name: 'India',
      value: 1173657,
    },
    {
      name: 'Japan',
      value: 857363,
    },
    {
      name: 'Germany',
      value: 496750,
    },
    {
      name: 'France',
      value: 204617,
    },
  ];
  // line chart start
  public multi = [
    {
      name: 'Germany',
      series: [
        {
          name: '2010',
          value: 7300000,
        },
        {
          name: '2011',
          value: 5840000,
        },
        {
          name: '2012',
          value: 7580000,
        },
        {
          name: '2013',
          value: 7920000,
        },
      ],
    },
    {
      name: 'USA',
      series: [
        {
          name: '2010',
          value: 5470000,
        },
        {
          name: '2011',
          value: 9270000,
        },
        {
          name: '2012',
          value: 5280000,
        },
        {
          name: '2013',
          value: 8580000,
        },
      ],
    },
    {
      name: 'France',
      series: [
        {
          name: '2010',
          value: 5000002,
        },
        {
          name: '2011',
          value: 5800000,
        },
        {
          name: '2012',
          value: 4580000,
        },
        {
          name: '2013',
          value: 7920000,
        },
      ],
    },
  ];
  // vaericle bar chart start
  vbarxAxisLabel = 'Country';
  vbaryAxisLabel = 'Sales';
  // horizontal bar chart start
  hbarxAxisLabel = 'Sales';
  hbaryAxisLabel = 'Country';
  autoScale = true;
  linexAxisLabel = 'Year';
  lineyAxisLabel = 'Sales';
  // area chart
  areaxAxisLabel = 'Year';
  areayAxisLabel = 'Sales';
  shapeChartCurve = shape.curveBasis;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor() {
    // constructor
  }
}
