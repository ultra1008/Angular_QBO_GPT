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
import { TranslateModule } from '@ngx-translate/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CompanyInfoFormComponent } from './company-info-form/company-info-form.component';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSelectFilterModule } from 'mat-select-filter';
import { NgxGalleryModule } from 'ngx-gallery-9';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CommonComponentsModule } from '../common-components/common-components.module';
import { SharedModule } from '../shared/shared.module';
import { SettingsService } from './settings.service';
import { MailboxFormComponent } from './mailbox/mailbox-form/mailbox-form.component';

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
    DocumentviewComponent,
    CompanyInfoFormComponent,
    MailboxFormComponent,
  ],
  providers: [SettingsService],
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
    ComponentsModule,
    TranslateModule,
    MatSlideToggleModule,
    MatTableModule,
    MatPaginatorModule,
    MatSnackBarModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    MatCardModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSortModule,
    MatToolbarModule,
    MatMenuModule,
    SharedModule,
    ComponentsModule,
    InfiniteScrollModule,
    NgScrollbarModule,
    CommonComponentsModule,
    NgxGalleryModule,
    MatChipsModule,
    MatListModule,
    MatSelectFilterModule,
    TranslateModule,
  ],
})
export class SettingsModule {}
