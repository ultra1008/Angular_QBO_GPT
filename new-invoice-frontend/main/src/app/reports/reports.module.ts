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
    MatMenuModule

  ]
})
export class ReportsModule { }
