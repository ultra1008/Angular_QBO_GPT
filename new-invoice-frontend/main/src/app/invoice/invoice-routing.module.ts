import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { WEB_ROUTES } from 'src/consts/routes';
import { InvoiceListingComponent } from './invoice-listing/invoice-listing.component';
import { ViewDocumentComponent } from './view-document/view-document.component';

const routes: Routes = [
  {
    path: '',
    component: InvoiceListingComponent,
  },
  {
    path: WEB_ROUTES.DETAILS,
    component: InvoiceDetailComponent,
  },
  {
    path: WEB_ROUTES.VIEW_DOCUMENT,
    component: ViewDocumentComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
