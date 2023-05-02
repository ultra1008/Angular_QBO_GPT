import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { FormsModule } from '@angular/forms';
import { WidgetRoutingModule } from './widget-routing.module';
import { ChartWidgetComponent } from './chart-widget/chart-widget.component';
import { DataWidgetComponent } from './data-widget/data-widget.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { NgChartsModule } from 'ng2-charts';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { ComponentsModule } from '../shared/components/components.module';

@NgModule({
  declarations: [ChartWidgetComponent, DataWidgetComponent],
  imports: [
    CommonModule,
    WidgetRoutingModule,
    NgScrollbarModule,
    NgApexchartsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    DragDropModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTabsModule,
    NgChartsModule,
    ComponentsModule,
  ],
})
export class WidgetModule {}
