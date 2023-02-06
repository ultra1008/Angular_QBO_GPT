import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { httproutes, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { TranslateService } from "@ngx-translate/core";
import Swal from 'sweetalert2';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success margin-right-cust s2-confirm",
    denyButton: "btn btn-danger s2-confirm",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});


@Component({
  selector: 'app-document-view',
  templateUrl: './document-view.component.html',
  styleUrls: ['./document-view.component.scss']
})
export class DocumentViewComponent implements OnInit {
  documentviews: any;
  Document_View_time_value!: string;
  Document_View: boolean = false;
  settingObject: any;
  setting_id!: string;
  Document_Settings_Alert_Sure_Want_Change: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";

  constructor(private formBuilder: FormBuilder, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    public translate: TranslateService) {
    this.translate.stream([""]).subscribe((textarray) => {
      this.Document_Settings_Alert_Sure_Want_Change = this.translate.instant("Document_Settings_Alert_Sure_Want_Change");
      this.Compnay_Equipment_Delete_Yes = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.Compnay_Equipment_Delete_No = this.translate.instant("Compnay_Equipment_Delete_No");
    });
  }


  ngOnInit(): void {
    // this.documentviews = this.formBuilder.group({
    //   documentview: ['', Validators.required],

    // });
    let that = this;
    this.httpCall
      .httpGetCall(httproutes.PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS)
      .subscribe(function (params) {
        if (params.status) {
          if (params.data) {
            that.settingObject = params.data.settings;
            that.setting_id = params.data._id;
            if (params.data.settings.Document_View) {
              that.Document_View_time_value = params.data.settings.Document_View.setting_value;
              if (params.data.settings.Document_View.setting_status == "Active") {
                that.Document_View = true;
              } else {
                that.Document_View = false;
              }
            } else {
              that.Document_View = false;
              that.Document_View_time_value = '45';
            }


          }
        }
      });

  }

  modelChangeSwitch(event: any, checkoption: any) {
    let settingKey = "settings." + checkoption;
    let obj = this.settingObject[checkoption];
    obj.setting_status = event ? "Active" : "Inactive";
    let reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Document_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.updateSetting(reqObject);
        } else {
          if (checkoption == "Document_View") {
            that.Document_View = !event;
          }
        }
      });
  }
  updateSetting(objectForEdit: any) {
    console.log("log1",);
    let userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? "");
    let that = this;
    objectForEdit._id = that.setting_id;
    this.httpCall
      .httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTING_UPDATE_ALERTS, objectForEdit)
      .subscribe(function (params) {
        if (params.status) {
          console.log("log2", params.status);
          that.snackbarservice.openSnackBar(params.message, "success");
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });
  }

  modelChangeLocationText(event, checkoption) {
    let settingKey = "settings." + checkoption;
    let obj = this.settingObject[checkoption];
    console.log("obj: ", obj);
    console.log("settingKey: ", settingKey);
    obj.setting_value = event;
    let reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Document_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          console.log("reqObject: ", reqObject);
          that.updateSetting(reqObject);


        } else {
          if (checkoption == "Document_View") {
            console.log("reqObject1111: ", reqObject);
            that.Document_View_time_value =
              that.settingObject.Document_View.setting_value;
          }
        }
      });
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

}
