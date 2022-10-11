import { Component, OnInit } from "@angular/core";
import { HttpCall } from "src/app/service/httpcall.service";
import { httproutes } from "src/app/consts";
import { Snackbarservice } from "src/app/service/snack-bar-service";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { configdata } from "src/environments/configData";
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success margin-right-cust s2-confirm",
    denyButton: "btn btn-danger s2-confirm",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});


@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent implements OnInit {
  settingObject: any;
  setting_id!: string;
  clockinradius_value!: string;
  Pending_items: boolean = false;
  Pending_items_value!: string;
  Invoice_due_date: boolean = false;
  Invoice_due_date_value!: string;
  Invoice_arrive: boolean = false;
  Invoice_arrive_value!: string;
  Invoice_modified: boolean = false;
  Invoice_modified_value!: string;
  Invoice_sent_to_batch: boolean = false;
  Invoice_sent_to_batch_value!: string;
  daily_productivity_report: boolean = false;
  daily_productivity_report_value!: string;
  pendingdata: any = configdata.PENDINGITEM_ALERT;
  duetime: any = configdata.INVOICE_DUE_TIME_ALERT;
  duedate: any = configdata.INVOICE_DUE_DAY_ALERT;

  Project_Settings_Alert_Sure_Want_Change: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  allRoles: any = [];
  allUser: any = [];
  pendingitems: string = "";
  temppendingitems: string = "";


  constructor(
    public httpCall: HttpCall,
    public snackbarservice: Snackbarservice,
    public translate: TranslateService
  ) {
    this.translate.stream([""]).subscribe((textarray) => {
      this.Project_Settings_Alert_Sure_Want_Change = this.translate.instant(
        "Project_Settings_Alert_Sure_Want_Change"
      );
      this.Compnay_Equipment_Delete_Yes = this.translate.instant(
        "Compnay_Equipment_Delete_Yes"
      );
      this.Compnay_Equipment_Delete_No = this.translate.instant(
        "Compnay_Equipment_Delete_No"
      );
    });
  }

  ngOnInit(): void {

    let that = this;
    that.getAllRoles();
    that.getAllUser();
    this.httpCall
      .httpGetCall(httproutes.PORTAL_ROVUK_INVOICE__SETTINGS_GET_ALL_ALERTS)
      .subscribe(function (params) {
        if (params.status)
        {
          that.settingObject = params.data.settings;
          that.setting_id = params.data._id;
          that.Pending_items =
            params.data.settings.Pending_items.setting_value;
          if (
            params.data.settings.Pending_items.setting_status ==
            "Active"
          )
          {
            that.Pending_items = true;
          } else
          {
            that.Pending_items = false;
          }
          that.Invoice_due_date_value =
            params.data.settings.Invoice_due_date_value.setting_value;
          if (
            params.data.settings.Invoice_due_date_value.setting_status ==
            "Active"
          )
          {
            that.Invoice_due_date = true;
          } else
          {
            that.Invoice_due_date = false;
          }
          that.Invoice_arrive_value =
            params.data.settings.Invoice_arrive_value.setting_value;
          if (
            params.data.settings.Invoice_arrive_value.setting_status ==
            "Active"
          )
          {
            that.Invoice_arrive = true;
          } else
          {
            that.Invoice_arrive = false;
          }
          that.Invoice_modified =
            params.data.settings.Invoice_modified.setting_value;
          if (
            params.data.settings.Invoice_modified.setting_status ==
            "Active"
          )
          {
            that.Invoice_modified = true;
          } else
          {
            that.Invoice_modified = false;
          }
          if (
            params.data.settings.daily_productivity_report.setting_status == "Active"
          )
          {
            that.daily_productivity_report = true;
          } else
          {
            that.daily_productivity_report = false;
          }
          if (
            params.data.settings.Invoice_sent_to_batch.setting_status ==
            "Active"
          )
          {
            that.Invoice_sent_to_batch = true;
          } else
          {
            that.Invoice_sent_to_batch = false;
          }

        }
      });
  }

  modelChangeLocation(event: any, checkoption: any) {
    console.log("hello", this.settingObject)
    let settingKey = "settings." + checkoption;
    let obj = this.settingObject[checkoption];
    obj.setting_status = event ? "Active" : "Inactive";
    let reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Project_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed)
        {
          that.updateSetting(reqObject);
        } else
        {
          if (checkoption == "Pending_items")
          {
            that.Pending_items = !event;
          } else if (checkoption == "Invoice_due_date")
          {
            that.Invoice_due_date = !event;
          } else if (checkoption == "daily_productivity_report")
          {
            that.daily_productivity_report = !event;
          } else if (checkoption == "Invoice_sent_to_batch")
          {
            that.Invoice_sent_to_batch = !event;
          } else if (checkoption == "Invoice_arrive")
          {
            that.Invoice_arrive = !event;
          } else if (checkoption == "Invoice_modified")
          {
            that.Invoice_modified = !event;
          }
        }
      });
  }

  modelChangeLocationText(event: any, checkoption: any) {
    let settingKey = "settings." + checkoption;
    let obj = this.settingObject[checkoption];
    obj.setting_value = event;
    let reqObject = {
      [settingKey]: obj,
    };
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Project_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed)
        {
          that.updateSetting(reqObject);
        } else
        {
          if (checkoption == "Pending_items")
          {
            that.Pending_items_value =
              that.settingObject.Pending_items.setting_value;
          } else if (checkoption == "Invoice_due_date_value")
          {
            that.Invoice_due_date_value =
              that.settingObject.Invoice_due_date_value.setting_value;
          } else if (checkoption == "Invoice_arrive_value")
          {
            that.Invoice_arrive_value =
              that.settingObject.Invoice_arrive_value.setting_value;
          } else if (checkoption == "Invoice_modified")
          {
            that.Invoice_modified =
              that.settingObject.Invoice_modified.setting_value;
          } else if (checkoption == "Invoice_sent_to_batch_value")
          {
            that.Invoice_sent_to_batch_value =
              that.settingObject.Invoice_sent_to_batch_value.setting_value;
          } else if (checkoption == "daily_productivity_report_value")
          {
            that.daily_productivity_report_value =
              that.settingObject.daily_productivity_report_value.setting_value;
          }
        }
      });
  }
  getAllRoles() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_ROLES_ALL).subscribe(function (params) {
      if (params.status)
      {
        that.allRoles = params.data;
        console.log("role", that.allRoles)
      }
    });
  }

  getAllUser() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_GET_ALL_USERS).subscribe(function (params) {
      if (params.status)
      {
        that.allUser = params.data;
        console.log("role", that.allUser)
      }
    });
  }
  // modelChangeTimeout(event: any) {
  //   console.log(event);
  //   this.pendingitems = event;
  //   let settingKey = "settings." + "Auto_Log_Off";
  //   let obj = this.settingObject["Auto_Log_Off"];
  //   obj.setting_value = event;
  //   let reqObject = {
  //     [settingKey]: obj,
  //   };
  //   console.log(reqObject);
  //   let that = this;
  //   swalWithBootstrapButtons
  //     .fire({
  //       title: this.Project_Settings_Alert_Sure_Want_Change,
  //       showDenyButton: true,
  //       showCancelButton: false,
  //       confirmButtonText: this.Compnay_Equipment_Delete_Yes,
  //       denyButtonText: this.Compnay_Equipment_Delete_No,
  //     })
  //     .then((result) => {
  //       if (result.isConfirmed)
  //       {
  //         that.pendingitems = event;
  //         that.updateSetting(reqObject);
  //       } else
  //       {
  //         console.log(this.pendingitems);
  //         that.pendingitems = that.temppendingitems;
  //       }
  //     });
  // }


  updateSetting(objectForEdit: any) {
    let userData = JSON.parse(localStorage.getItem("userdata") ?? "");
    let that = this;
    objectForEdit._id = that.setting_id;
    this.httpCall
      .httpPostCall(httproutes.PORTAL_ROVUK_INVOICE_OTHER_SETTING_UPDATE_ALERTS, objectForEdit)
      .subscribe(function (params) {
        if (params.status)
        {
          that.snackbarservice.openSnackBar(params.message, "success");
        } else
        {
          that.snackbarservice.openSnackBar(params.message, "error");
        }
      });
  }
}
