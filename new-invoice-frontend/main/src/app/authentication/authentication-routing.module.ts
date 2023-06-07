import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SigninComponent } from './signin/signin.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LockedComponent } from './locked/locked.component';
import { SendOtpComponent } from './send-otp/send-otp.component';
import { ForcefullChangePasswordComponent } from './forcefull-change-password/forcefull-change-password.component';
import { Page404Component } from './page404/page404.component';
const routes: Routes = [
  /* {
    path: '',
    redirectTo: 'signin',
    pathMatch: 'full'
  }, */
  {
    path: '',
    component: SigninComponent
  },
  {
    path: 'signin',
    component: SigninComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'change-password',
    component: ForcefullChangePasswordComponent
  },
  {
    path: 'send-otp',
    component: SendOtpComponent
  },
  {
    path: 'locked',
    component: LockedComponent
  },
  {
    path: 'page404',
    component: Page404Component
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
