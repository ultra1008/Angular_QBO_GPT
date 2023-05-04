import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history/history.component';
import { PhoneFormatPipe } from './common.pipe';
import { LoadingComponent } from './loading/loading.component';

@NgModule({
  declarations: [
    HistoryComponent,
    PhoneFormatPipe,
    LoadingComponent,
  ],
  exports: [
    HistoryComponent,
    PhoneFormatPipe,
    LoadingComponent,
  ],
  imports: [
    CommonModule,
  ]
})
export class CommonComponentsModule { }
