import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Third1Component } from './third1/third1.component';

const routes: Routes = [
  {
    path: 'third1',
    component: Third1Component,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThirdlevelRoutingModule {}
