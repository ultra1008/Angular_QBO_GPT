import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import * as _ from 'lodash';
import * as XLSX from 'xlsx';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ModeDetectService } from "../../map/mode-detect.service";
import * as fs from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LanguageApp } from 'src/app/service/utils';
import Swal from 'sweetalert2';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false
});

@Component({
  selector: 'app-settings-employee',
  templateUrl: './settings-employee.component.html',
  styleUrls: ['./settings-employee.component.scss']
})
export class SettingsEmployeeComponent implements OnInit {

  @ViewChild('OpenFilebox') OpenFilebox: any;
  Company_Equipment_File_Not_Match: any;
  archivedIcon: any;
  mode: any;
  historyIcon: any;
  exportIcon: any;
  importIcon: string;
  subscription: Subscription;
  copyDataFromProject: string = '';
  yesButton: string = '';
  noButton: string = '';
  show_tabs: boolean = true;

  constructor(private modeService: ModeDetectService, public httpCall: HttpCall, public dialog: MatDialog,
    public sb: Snackbarservice, public translate: TranslateService) {
    let that = this;
    this.translate.stream(['']).subscribe((textarray) => {
      that.Company_Equipment_File_Not_Match = that.translate.instant('Company_Equipment_File_Not_Match');
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.importIcon = icon.IMPORT;

    } else {
      this.importIcon = icon.IMPORT_WHITE;

    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {

      if (mode) {
        this.mode = 'off';
        this.importIcon = icon.IMPORT;

      } else {
        this.mode = 'on';
        this.importIcon = icon.IMPORT_WHITE;

      }

      console.log("DARK MODE: " + this.mode);
    });

    //let that = this;
    // this.uiSpinner.spin$.next(true);
    this.translate.stream(['']).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant('Copy_Data_From_Project');
      this.yesButton = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.noButton = this.translate.instant('Compnay_Equipment_Delete_No');
    });



  }

  downloadImportTemplate() {
    let that = this;
    const dialogRef = this.dialog.open(ImportEmpSettingDownload, {
      data: "employee-setting",
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
  openErrorDataDialog(data: any) {
    let that = this;
    const dialogRef = this.dialog.open(ImportDataErrorEmpSetting, {
      data: data,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      that.show_tabs = false;
      setTimeout(() => {
        that.show_tabs = true;
      }, 1000);
    });
  }

  ngOnInit(): void {
  }

  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }
  onFileChange(ev: any) {
    let that = this;
    let workBook: any = null;
    let jsonData = null;
    let header_: any;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        let data = (XLSX.utils.sheet_to_json(sheet, { header: 1 }));
        header_ = data.shift();

        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);
      const keys_OLD = ['department_name', 'job_title_name', 'job_type_name', 'payroll_group_name'];
      if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header_.sort())) {
        that.sb.openSnackBar(that.Company_Equipment_File_Not_Match, "error");
        return;
      } else {
        const formData_profle = new FormData();
        formData_profle.append("file", file);
        that.httpCall.httpPostCall(httproutes.PORTAL_COMPANY_EMPLOYEE_SETTING, formData_profle).subscribe(function (params) {
          if (params.status) {
            that.openErrorDataDialog(params);

            //that.sb.openSnackBar(params.message, "success");
            //that.rerenderfunc();
          } else {
            that.sb.openSnackBar(params.message, "error");
          }
        });
      }
    };
    reader.readAsBinaryString(file);
  }

}

/**
 * Dialog created by Hemin S Patel
 * Date 23-05-2022
 * 
 * Import file button click 
 * open dialog and display instruction for download button for file
 * 
 * last update by Hemin patel
 * last update at 23-05-2022 : 02:42AM
 * 
 * need to put only download button  dialog for text instruction need to wait for client (21-05-2022 03:25AM)
 */

@Component({
  selector: 'importEmpSetting-download',
  templateUrl: './importEmpSetting-download.html',
  styleUrls: ['./settings-employee.component.scss']
})

export class ImportEmpSettingDownload {
  dtOptions: DataTables.Settings = {};
  constructor(
    public dialogRef: MatDialogRef<ImportEmpSettingDownload>,
    @Inject(MAT_DIALOG_DATA) public data: any, public translate: TranslateService) {

  }

  downloadImportTemplate() {
    this.dialogRef.close();
    // if (this.data == "employee-setting") {
    //   return saveAs('./assets/files/employee_setting.xlsx', "employee_setting.xlsx");
    // } else if (this.data == "other-setting") {
    //   return saveAs('./assets/files/other_setting.xlsx', "other_setting.xlsx");
    // } else if (this.data == "costcode-setting") {
    //   return saveAs('./assets/files/Costcode.xlsx', "Costcode.xlsx");
    // }

  }
}

/**
 * Dialog created by Hemin S Patel
 * Date 24-05-2022
 * 
 * as per task and discussion need to display error data in dialog and
 * need give skip and correct button
 * 
 * last update by Hemin patel
 * last update at 24-05-2022 : 12:12AM
 * 
 * we did't get Edit and correct data solution and which solution we get this 
 * solution needs R & D  time so not implemented this(21-05-2022 11:58AM)
 * 
 *  In this function need to create TAB for each module and save as per which TAB is curratnt active 
 * as per  discussed with krunal bhai(time 23-05-2022 05:00PM)
 */

@Component({
  selector: 'importdataerrorempsetting',
  templateUrl: './importdataerrorempsetting.html',
  styleUrls: ['./settings-employee.component.scss']
})

export class ImportDataErrorEmpSetting {
  dtOptions: DataTables.Settings = {};
  tab_Array: any = ['Department', 'Job title', 'Job type', "Payroll group"];
  currrent_tab: string = "Department";

  success_buttons: boolean = false;
  failed_buttons: boolean = false;
  import_cancel_error: any;
  Compnay_Equipment_Delete_Yes: any;
  Compnay_Equipment_Delete_No: any;
  constructor(
    public dialogRef: MatDialogRef<ImportDataErrorEmpSetting>, public httpCall: HttpCall, public uiSpinner: UiSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any, public translate: TranslateService, public sb: Snackbarservice) {
    this.import_cancel_error = this.translate.instant('import_cancel_error');
    this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
    this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
    dialogRef.disableClose = true;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.dtOptions = {
      pagingType: 'full_numbers',
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
    };

    if (data.data.department_name.new_department_name_error.length >= 1) {
      this.failed_buttons = true;
      this.success_buttons = false;
    } else {
      this.success_buttons = true;
      this.failed_buttons = false;
    }
  }

  onTabChanged($event: any) {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.currrent_tab = this.tab_Array[$event.index];
    if (this.currrent_tab == "Department") {
      if (this.data.data.department_name.new_department_name_error.length >= 1) {
        this.failed_buttons = true;
        this.success_buttons = false;
      } else {
        this.success_buttons = true;
        this.failed_buttons = false;
      }
    } else if (this.currrent_tab == "Job title") {
      if (this.data.data.job_title.new_job_title_name_error.length >= 1) {
        this.failed_buttons = true;
        this.success_buttons = false;
      } else {
        this.success_buttons = true;
        this.failed_buttons = false;
      }
    } else if (this.currrent_tab == "Job type") {
      if (this.data.data.job_type.new_job_type_name_error.length >= 1) {
        this.failed_buttons = true;
        this.success_buttons = false;
      } else {
        this.success_buttons = true;
        this.failed_buttons = false;
      }
    } else if (this.currrent_tab == "Payroll group") {
      if (this.data.data.payroll_group.new_payroll_group_name_error.length >= 1) {
        this.failed_buttons = true;
        this.success_buttons = false;
      } else {
        this.success_buttons = true;
        this.failed_buttons = false;
      }
    }
    this.dtOptions = {
      pagingType: 'full_numbers',
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
    };
  }


  saveData() {
    let requestObject = {

    };
    if (this.currrent_tab == "Department") {
      requestObject = {
        module: this.currrent_tab,
        data: this.data.data.department_name.new_department_name_data
      };
    } else if (this.currrent_tab == "Job title") {
      requestObject = {
        module: this.currrent_tab,
        data: this.data.data.job_title.new_job_title_name_data
      };
    } else if (this.currrent_tab == "Job type") {
      requestObject = {
        module: this.currrent_tab,
        data: this.data.data.job_type.new_job_type_name_data
      };
    } else if (this.currrent_tab == "Payroll group") {
      requestObject = {
        module: this.currrent_tab,
        data: this.data.data.payroll_group.new_payroll_group_name_data
      };
    }
    let that = this;

    this.uiSpinner.spin$.next(true);
    this.httpCall.httpPostCall(httproutes.PORTAL_CHECK_AND_INSERT_EMP_SETTING, requestObject).subscribe(function (params) {
      if (params.status) {
        that.uiSpinner.spin$.next(false);
        that.sb.openSnackBar(params.message, "success");
        that.dialogRef.close();
      } else {
        that.uiSpinner.spin$.next(false);
        that.sb.openSnackBar(params.message, "error");
      }
    });
  }

  cancelImport() {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: this.import_cancel_error,
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
      allowOutsideClick: false
    }).then((result) => {
      that.dialogRef.close();
    });
  }


}
