import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsListingComponent } from './reports-listing/reports-listing.component';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatMenuModule } from '@angular/material/menu';
import { ReportService } from './report.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';


@NgModule({
  declarations: [
    ReportsListingComponent
  ],
  providers: [ReportService],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    MatTableModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatMenuModule,
    TranslateModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatFormFieldModule

  ]
})
export class ReportsModule { }
