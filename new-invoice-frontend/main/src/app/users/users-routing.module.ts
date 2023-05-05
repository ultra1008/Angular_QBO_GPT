import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UsersListingComponent } from './users-listing/users-listing.component';
import { UserGridComponent } from './user-grid/user-grid.component';
import { WEB_ROUTES } from 'src/consts/routes';

const routes: Routes = [
  {
    path: '',
    component: UsersListingComponent
  },
  {
    path: WEB_ROUTES.GRID,
    component: UserGridComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
