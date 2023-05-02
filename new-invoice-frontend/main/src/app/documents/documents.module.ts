import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentsRoutingModule } from './documents-routing.module';
import { DocumentsListingComponent } from './documents-listing/documents-listing.component';


@NgModule({
  declarations: [
    DocumentsListingComponent
  ],
  imports: [
    CommonModule,
    DocumentsRoutingModule
  ]
})
export class DocumentsModule { }
