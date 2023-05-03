import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorsRoutingModule } from './vendors-routing.module';
import { VendorsListComponent } from './vendors-list/vendors-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AdvanceTableRoutingModule } from '../advance-table/advance-table-routing.module';
import { ComponentsModule } from '../shared/components/components.module';
import { SharedModule } from '../shared/shared.module';
import { VendorsService } from './vendors.service';
import { VendorFormComponent } from './vendor-form/vendor-form.component';
import { VendorHistoryComponent } from './vendor-history/vendor-history.component';
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgScrollbarModule } from 'ngx-scrollbar';
import { CommonComponentsModule } from '../common-components/common-components.module';

@NgModule({
  declarations: [
    VendorsListComponent,
    VendorFormComponent,
    VendorHistoryComponent
  ],
  providers: [VendorsService],
  imports: [
    CommonModule,
    VendorsRoutingModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdvanceTableRoutingModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
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
  ]
})
export class VendorsModule { }
