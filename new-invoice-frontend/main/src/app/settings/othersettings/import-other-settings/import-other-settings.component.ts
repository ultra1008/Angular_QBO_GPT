import { Component, Inject } from '@angular/core';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  FormGroup,
  FormControl,
  Validators,
  UntypedFormControl,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { AdvanceTable } from 'src/app/users/user.model';
import { icon } from 'src/consts/icon';
import { showNotification } from 'src/consts/utils';
import { SettingsService } from '../../settings.service';
import { TaxRateFormComponent } from '../tax-rate-form/tax-rate-form.component';
import * as saveAs from 'file-saver';

@Component({
  selector: 'app-import-other-settings',
  templateUrl: './import-other-settings.component.html',
  styleUrls: ['./import-other-settings.component.scss'],
})
export class ImportOtherSettingsComponent {
  action: string;
  dialogTitle: string;
  currrent_tab: any;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];

  roleList: any = this.variablesRoleList.slice();
  titleMessage: string = '';
  userList: any = [];
  isDelete = 0;
  invoice_logo = icon.INVOICE_LOGO;
  constructor(
    public dialogRef: MatDialogRef<ImportOtherSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: SettingsService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
    private router: Router,
    public uiSpinner: UiSpinnerService
  ) {
    console.log('data', data);
    this.currrent_tab = data;
    // Set the defaults
    this.action = data.action;
    if (this.action === 'edit') {
      this.dialogTitle =
        data.advanceTable.fName + ' ' + data.advanceTable.lName;
      this.advanceTable = data.advanceTable;
    } else {
      this.dialogTitle = 'New Record';
      const blankObject = {} as AdvanceTable;
      this.advanceTable = new AdvanceTable(blankObject);
    }
  }

  downloadImport() {
    this.dialogRef.close();
    if (this.currrent_tab == 'Terms') {
    } else if (this.currrent_tab == 'Tax rate') {
    } else if (this.currrent_tab == 'Documents') {
    } else if (this.currrent_tab == 'Vendor type') {
    } else if (this.currrent_tab == 'Job name') {
      return saveAs('./assets/files/jobnameimport.xlsx', 'jobnameimport.xlsx');
    }
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
