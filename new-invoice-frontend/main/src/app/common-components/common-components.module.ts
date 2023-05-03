import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history/history.component';
import { HistoryDateTimePipe } from './common.pipe';

@NgModule({
  declarations: [
    HistoryComponent,
    HistoryDateTimePipe
  ],
  exports: [
    HistoryComponent
  ],
  imports: [
    CommonModule,
  ]
})
export class CommonComponentsModule { }
