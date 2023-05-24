import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HistoryComponent } from './history/history.component';
import { PhoneFormatPipe } from './common.pipe';
import { LoadingComponent } from './loading/loading.component';
import { TranslateModule } from '@ngx-translate/core';
import { CustompdfviewerComponent } from './custompdfviewer/custompdfviewer.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@NgModule({
  declarations: [
    HistoryComponent,
    PhoneFormatPipe,
    LoadingComponent,
    CustompdfviewerComponent,
  ],
  exports: [
    HistoryComponent,
    PhoneFormatPipe,
    LoadingComponent,
  ],
  imports: [
    CommonModule,
    TranslateModule,
    PdfViewerModule
  ]
})
export class CommonComponentsModule { }
