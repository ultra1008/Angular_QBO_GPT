import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllsettingsComponent } from './allsettings/allsettings.component';

const routes: Routes = [
  {
    path: '',
    component: AllsettingsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
