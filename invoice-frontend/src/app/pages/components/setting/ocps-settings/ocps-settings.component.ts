import { Component, OnInit, Inject, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { httproutes, httproutesv2, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { ModeDetectService } from '../../map/mode-detect.service';
import { ImportDataErrorEmpSetting, ImportEmpSettingDownload } from '../settings-employee/settings-employee.component';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false
});

class DataTablesResponse {
  data: any;
  draw: any;
  recordsFiltered: any;
  recordsTotal: any;
}

@Component({
  selector: 'app-ocps-settings',
  templateUrl: './ocps-settings.component.html',
  styleUrls: ['./ocps-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OcpsSettingsComponent implements OnInit {

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
    const dialogRef = this.dialog.open(ImOtherDownload, {
      data: "employee-setting",
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }
  openErrorDataDialog(data: any) {
    let that = this;
    const dialogRef = this.dialog.open(ImportOther, {
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



}

@Component({
  selector: 'importdataerrorothsetting',
  templateUrl: './importdataerrorothsetting.html',
  styleUrls: ['./ocps-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImportOther implements OnInit {
  constructor(private modeService: ModeDetectService, public dialogRef: MatDialogRef<ImportOther>, public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any, public httpCall: HttpCall, public snackbarservice: Snackbarservice) { }
  ngOnInit(): void {

  }
}

@Component({
  selector: 'importothSetting-download',
  templateUrl: './importothSetting-download.html',
  styleUrls: ['./ocps-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImOtherDownload implements OnInit {
  constructor(private modeService: ModeDetectService, public dialogRef: MatDialogRef<ImOtherDownload>, public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any, public httpCall: HttpCall, public snackbarservice: Snackbarservice) { }
  ngOnInit(): void {

  }
}
