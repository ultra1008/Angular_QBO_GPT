import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsListingComponent } from './reports-listing/reports-listing.component';

const routes: Routes = [

  {
    path: '',
    component: ReportsListingComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
