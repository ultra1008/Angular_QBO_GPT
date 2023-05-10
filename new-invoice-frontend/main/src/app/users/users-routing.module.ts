import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListingComponent } from './users-listing/users-listing.component';
import { UserGridComponent } from './user-grid/user-grid.component';
import { WEB_ROUTES } from 'src/consts/routes';
import { UserHistoryComponent } from './user-history/user-history.component';
import { UserFormComponent } from './user-form/user-form.component';

const routes: Routes = [
  {
    path: '',
    component: UsersListingComponent
  },
  {
    path: WEB_ROUTES.GRID,
    component: UserGridComponent
  },
  {
    path: WEB_ROUTES.HISTORY,
    component: UserHistoryComponent
  },
  {
    path: WEB_ROUTES.FORM,
    component: UserFormComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }