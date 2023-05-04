import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history/history.component';
import { HistoryDateTimePipe } from './common.pipe';
import { LoadingComponent } from './loading/loading.component';

@NgModule({
  declarations: [
    HistoryComponent,
    HistoryDateTimePipe,
    LoadingComponent,
  ],
  exports: [
    HistoryComponent,
    LoadingComponent,
  ],
  imports: [
    CommonModule,
  ]
})
export class CommonComponentsModule { }
