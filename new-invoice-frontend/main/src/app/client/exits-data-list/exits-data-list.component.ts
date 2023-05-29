import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import * as saveAs from 'file-saver';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { AdvanceTable } from 'src/app/users/user.model';
import { icon } from 'src/consts/icon';
import { ClientService } from '../client.service';
import { ImportClientComponent } from '../import-client/import-client.component';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { showNotification } from 'src/consts/utils';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-exits-data-list',
  templateUrl: './exits-data-list.component.html',
  styleUrls: ['./exits-data-list.component.scss']
})
export class ExitsDataListComponent extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  action: string;
  dialogTitle: string;
  currrent_tab: any;
  advanceTable: AdvanceTable;
  variablesRoleList: any = [];
  exitData: any = [];
  button_show: boolean;
  roleList: any = this.variablesRoleList.slice();
  titleMessage: string = '';
  userList: any = [];
  isDelete = 0;
  invoice_logo = icon.INVOICE_LOGO;
  constructor(
    public dialogRef: MatDialogRef<ImportClientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public advanceTableService: ClientService,
    private fb: UntypedFormBuilder,
    private snackBar: MatSnackBar,
    public SettingsServices: ClientService,
    private commonService: CommonService,
    private router: Router,
    public uiSpinner: UiSpinnerService
  ) {
    super();
    console.log('data', data);
    this.exitData = data.data;
    this.button_show = data.allow_import;
    console.log("exitData", this.exitData);
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


  ngOnInit(): void {

  }

  async import() {
    this.uiSpinner.spin$.next(true);
    const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.IMPORT_CLIENT, this.exitData);
    this.uiSpinner.spin$.next(false);
    if (data.status) {
      this.dialogRef.close();
      showNotification(this.snackBar, data.message, 'success');
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
    this.dialogRef.close();

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
