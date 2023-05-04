import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { AllsettingsComponent } from './allsettings/allsettings.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { ComponentsModule } from '../shared/components/components.module';
import { MailboxComponent } from './mailbox/mailbox.component';
import { EmployeesettingsComponent } from './employeesettings/employeesettings.component';
import { RolesettingsComponent } from './rolesettings/rolesettings.component';
import { AlertsComponent } from './alerts/alerts.component';
import { SmtpComponent } from './smtp/smtp.component';
import { IntegrationComponent } from './integration/integration.component';
import { UsageComponent } from './usage/usage.component';
import { OthersettingsComponent } from './othersettings/othersettings.component';
import { SecurityComponent } from './security/security.component';
import { CostcodeComponent } from './costcode/costcode.component';
import { DocumentviewComponent } from './documentview/documentview.component';


@NgModule({
  declarations: [
    AllsettingsComponent,
    MailboxComponent,
    EmployeesettingsComponent,
    RolesettingsComponent,
    AlertsComponent,
    SmtpComponent,
    IntegrationComponent,
    UsageComponent,
    OthersettingsComponent,
    SecurityComponent,
    CostcodeComponent,
    DocumentviewComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,


    FormsModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTabsModule,
    ComponentsModule
  ]
})
export class SettingsModule { }
