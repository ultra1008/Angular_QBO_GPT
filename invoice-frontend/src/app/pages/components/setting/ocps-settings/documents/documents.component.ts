import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { icon, localstorageconstants, httproutes } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import Swal from 'sweetalert2';
import { ModeDetectService } from '../../../map/mode-detect.service';
import { TaxRateForm } from '../tax-rate/tax-rate.component';
import { TermsForm } from '../terms/terms.component';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false
});

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements OnInit {
  Employee_Documents_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";

  addIcon = icon.ADD_MY_SELF_WHITE;
  editIcon: string;
  deleteIcon: string;
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';
  yesButton: string = '';
  noButton: string = '';

  constructor(private modeService: ModeDetectService, public dialog: MatDialog, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    public translate: TranslateService) {
    this.translate.stream(['']).subscribe((textarray) => {
      this.Employee_Documents_Do_Want_Delete = this.translate.instant('Employee_Documents_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
      this.copyDataFromProject = this.translate.instant('Copy_Data_From_Project');
      this.yesButton = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.noButton = this.translate.instant('Compnay_Equipment_Delete_No');
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off')
    {
      this.editIcon = icon.EDIT;
      this.deleteIcon = icon.DELETE;

    } else
    {
      this.editIcon = icon.EDIT_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;

    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode)
      {
        this.mode = 'off';
        this.editIcon = icon.EDIT;
        this.deleteIcon = icon.DELETE;


      } else
      {
        this.mode = 'on';
        this.editIcon = icon.EDIT_WHITE;
        this.deleteIcon = icon.DELETE_WHITE;

      }
      console.log("DARK MODE: " + this.mode);
    });
  }

  public allDocuments: any;
  ngOnInit(): void {
    this.getDataDocutments();
  }

  addDocument(docutments: any) {
    const dialogRef = this.dialog.open(DocumentForm, {
      data: docutments,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getDataDocutments();
    });
  }

  getDataDocutments() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTINGS_GET_DOCUMENT).subscribe(function (params) {
      if (params.status)
      {
        that.allDocuments = params.data;
      }
    });
  }

  deleteDocumentType(docutments: any) {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: this.Employee_Documents_Do_Want_Delete,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed)
      {
        that.httpCall.httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTING_DELETE_DOCUMENT, { _id: docutments._id }).subscribe(function (params) {
          if (params.status)
          {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.getDataDocutments();
          } else
          {
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }
}

@Component({
  selector: 'document-form',
  templateUrl: './document-form.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentForm implements OnInit {
  public documentform: FormGroup;
  saveIcon = icon.SAVE_WHITE;
  exitIcon: string;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';

  constructor(private modeService: ModeDetectService, public dialogRef: MatDialogRef<DocumentForm>, public translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public data: any, public httpCall: HttpCall, public snackbarservice: Snackbarservice) {

    this.documentform = new FormGroup({
      name: new FormControl("", [Validators.required]),
    });
    if (this.data)
    {
      this.documentform = new FormGroup({
        name: new FormControl(this.data.name, [Validators.required]),
      });
    }

    var modeLocal = localStorage.getItem('');
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off')
    {
      this.exitIcon = icon.BACK;

    } else
    {
      this.exitIcon = icon.BACK_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode)
      {
        this.mode = 'off';
        this.exitIcon = icon.BACK;

      } else
      {
        this.mode = 'on';
        this.exitIcon = icon.BACK_WHITE;

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

  ngOnInit() {

  }

  saveData() {
    let that = this;
    console.log("valid", that.documentform.valid)
    if (that.documentform.valid)
    {
      console.log("if1")
      let reqData = that.documentform.value;
      if (that.data)
      {
        reqData._id = that.data._id;
      }
      that.httpCall.httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTING_SAVE_DOCUMENT, reqData).subscribe(function (params) {
        if (params.status)
        {
          that.snackbarservice.openSnackBar(params.message, "success");
          that.dialogRef.close();
        } else
        {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });
    }
  }
}
