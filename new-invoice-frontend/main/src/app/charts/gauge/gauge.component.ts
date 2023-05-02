import { Component } from '@angular/core';
import { NgxGaugeType } from 'ngx-gauge/gauge/gauge';

interface GaugeValues {
  [key: number]: number;
}

@Component({
  selector: 'app-gauge',
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.scss'],
})
export class GaugeComponent {
  breadscrums = [
    {
      title: 'Gauge',
      items: ['Charts'],
      active: 'Gauge',
    },
  ];

  // ngx-guage start

  gaugeValue = 28.3;
  gaugeSize = 170;
  guageThick = 8;

  guageType1 = 'full' as NgxGaugeType;
  guageType2 = 'semi' as NgxGaugeType;
  guageType3 = 'arch' as NgxGaugeType;

  // ngx-guage end

  constructor() {
    this.percentageValue = function (value: number): string {
      return `${Math.round(value)}`;
    };
  }

  percentageValue: (value: number) => string;
  gaugeValues: GaugeValues = {
    1: 100,
    2: 50,
    3: 50,
    4: 50,
    5: 50,
    6: 50,
    7: 50,
  };
}
