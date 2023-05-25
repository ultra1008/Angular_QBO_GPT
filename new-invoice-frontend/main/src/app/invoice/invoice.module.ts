import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceRoutingModule } from './invoice-routing.module';
import { InvoiceListingComponent } from './invoice-listing/invoice-listing.component';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { TranslateModule } from '@ngx-translate/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { NgScrollbarModule } from 'ngx-scrollbar';


@NgModule({
  declarations: [
    InvoiceListingComponent,
    InvoiceDetailComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    InvoiceRoutingModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    PdfViewerModule,
    MatExpansionModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    MatTabsModule,
    MatSelectModule,
    NgScrollbarModule
  ]
})
export class InvoiceModule { }
