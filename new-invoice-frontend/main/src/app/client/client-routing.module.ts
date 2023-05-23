import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientComponent } from './client.component';
import { ClientFormComponent } from './client-form/client-form.component';
import { WEB_ROUTES } from 'src/consts/routes';

const routes: Routes = [
  {
    path: '',
    component: ClientComponent,
  },
  {
    path: WEB_ROUTES.FORM,
    component: ClientFormComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientRoutingModule {}
