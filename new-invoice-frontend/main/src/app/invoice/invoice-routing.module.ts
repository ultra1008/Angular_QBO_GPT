import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InvoiceDetailComponent } from './invoice-detail/invoice-detail.component';
import { WEB_ROUTES } from 'src/consts/routes';

const routes: Routes = [
  {
    path: WEB_ROUTES.DETAILS,
    component: InvoiceDetailComponent
  },
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceRoutingModule { }
