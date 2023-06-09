import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentsRoutingModule } from './documents-routing.module';
import { DocumentsListingComponent } from './documents-listing/documents-listing.component';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { CommonComponentsModule } from '../common-components/common-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { SettingsService } from '../settings/settings.service';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { DocumentsService } from './documents.service';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    DocumentsListingComponent
  ],
  providers: [DocumentsService],
  imports: [
    CommonModule,
    DocumentsRoutingModule,
    TranslateModule,
    MatTabsModule,
    MatTableModule,
    MatMenuModule,
    MatIconModule,
    MatPaginatorModule,
    CommonComponentsModule,
    MatTooltipModule,
    MatDialogModule,
    MatSortModule,
    MatSelectModule,
    SharedModule,
  ]
})
export class DocumentsModule { }
