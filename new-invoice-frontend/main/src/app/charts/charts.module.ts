import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsRoutingModule } from './charts-routing.module';
import { EchartComponent } from './echart/echart.component';
import { ChartjsComponent } from './chartjs/chartjs.component';
import { ApexchartComponent } from './apexchart/apexchart.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { NgChartsModule } from 'ng2-charts';
import { NgxchartComponent } from './ngxchart/ngxchart.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GaugeModule } from 'angular-gauge';
import { NgxGaugeModule } from 'ngx-gauge';
import { GaugeComponent } from './gauge/gauge.component';
import { ComponentsModule } from '../shared/components/components.module';
@NgModule({
  declarations: [
    EchartComponent,
    ChartjsComponent,
    ApexchartComponent,
    NgxchartComponent,
    GaugeComponent,
  ],
  imports: [
    CommonModule,
    ChartsRoutingModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts'),
    }),
    NgChartsModule,
    NgxChartsModule,
    NgApexchartsModule,
    NgxGaugeModule,
    GaugeModule.forRoot(),
    ComponentsModule,
  ],
})
export class ChartsModule {}
