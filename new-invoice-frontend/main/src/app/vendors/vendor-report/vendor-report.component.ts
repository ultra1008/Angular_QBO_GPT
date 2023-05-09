import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VendorsService } from '../vendors.service';
import { TermModel } from '../vendor-table.model';
import { configData } from 'src/environments/configData';
import { MatChipInputEvent } from '@angular/material/chips';
import { isValidMailFormat, showNotification } from 'src/consts/utils';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { localstorageconstants } from 'src/consts/localstorageconstants';

export interface DialogData {
  termsList: Array<any>;
  invoiceStatus: Array<any>;
}

@Component({
  selector: 'app-vendor-report',
  templateUrl: './vendor-report.component.html',
  styleUrls: ['./vendor-report.component.scss']
})
export class VendorReportComponent implements OnInit {
  vendorInfo: UntypedFormGroup;
  termsList: Array<TermModel> = [];
  statusList: Array<any> = configData.INVOICES_STATUS;
  emailsList: string[] = [];
  is_oneOnly: boolean = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;

  constructor(public uiSpinner: UiSpinnerService, public dialogRef: MatDialogRef<VendorReportComponent>, private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, public vendorService: VendorsService, private fb: UntypedFormBuilder,
  ) {
    // Set the defaults
    /* this.action = 'insert';
    if (this.action === 'edit') {
      this.dialogTitle =
        data.advanceTable.fName + ' ' + data.advanceTable.lName;
      this.advanceTable = data.advanceTable;
    } else {
      this.dialogTitle = 'New Record';
      const blankObject = {} as AdvanceTable;
      this.advanceTable = new AdvanceTable(blankObject);
    } */
    this.termsList = data.termsList;

    this.vendorInfo = this.fb.group({
      All_Terms: [true],
      terms_ids: [this.termsList.map((el) => el._id)],
      All_Invoice_Status: [true],
      invoice_status: [this.statusList.map((el) => el.key)],
    });
  }

  ngOnInit(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    that.vendorInfo.get("terms_ids")?.valueChanges.subscribe(function (params: any) {
      if (params.length == that.termsList.length) {
        that.vendorInfo.get("All_Terms")?.setValue(true);
      } else {
        that.vendorInfo.get("All_Terms")?.setValue(false);
      }
    });
    that.vendorInfo.get("invoice_status")?.valueChanges.subscribe(function (params: any) {
      if (params.length == that.statusList.length) {
        that.vendorInfo.get("All_Invoice_Status")?.setValue(true);
      } else {
        that.vendorInfo.get("All_Invoice_Status")?.setValue(false);
      }
    });
  }

  onChangeValueAll_Terms(params: any) {
    if (params.checked) {
      this.vendorInfo.get("terms_ids")?.setValue(this.termsList.map((el) => el._id));
    } else {
      this.vendorInfo.get("terms_ids")?.setValue([]);
    }
  }

  onChangeValueAll_VendorStatus(params: any) {
    if (params.checked) {
      this.vendorInfo.get("invoice_status")?.setValue(this.statusList.map((el) => el.key));
    } else {
      this.vendorInfo.get("invoice_status")?.setValue([]);
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  addEmail(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    // Add our fruit
    if (value) {
      const validEmail = isValidMailFormat(value);
      if (validEmail) {
        this.emailsList.push(value);
        // Clear the input value
        event.chipInput!.clear();
      } else {
        // here error for valid email
      }
    }
    // Clear the input value
    event.chipInput!.clear();
  }
  addmyself() {
    if (this.is_oneOnly) {
      let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
      this.emailsList.push(user_data.UserData.useremail);
      this.is_oneOnly = false;
    }
  }

  removeEmail(email: string): void {
    let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    const index = this.emailsList.indexOf(email);

    if (index >= 0) {
      this.emailsList.splice(index, 1);
      if (email == user_data.UserData.useremail) {
        this.is_oneOnly = true;
      }
    }
  }

  async sendReport(): Promise<void> {
    if (this.emailsList.length != 0) {
      this.uiSpinner.spin$.next(true);
      const requestObject = this.vendorInfo.value;
      requestObject.email_list = this.emailsList;
      this.vendorService.sendVendorReport(requestObject);
      setTimeout(() => {
        this.uiSpinner.spin$.next(false);
        this.dialogRef.close();
        showNotification(this.snackBar, 'Vendor report is sent to your email.', 'success');
      }, 1000);
    } else {
      showNotification(this.snackBar, 'Please enter email.', 'error');
    }
  }

  addInternalEmail(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();
    // Add email
    if (value) {
      const validEmail = isValidMailFormat(value);
      if (validEmail) {
        this.emailsList.push(value);
        // Clear the input value
        event.chipInput!.clear();
      } else {
        // here error for valid email
      }
    }
  }

  internalEmailremove(email: string): void {
    //----
    // let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    //----
    const index = this.emailsList.indexOf(email);
    if (index >= 0) {
      this.emailsList.splice(index, 1);
      //----
      // if (email == user_data.UserData.useremail) {
      //   this.is_oneOnly = true;
      // }
      //----
    }
  }

}
