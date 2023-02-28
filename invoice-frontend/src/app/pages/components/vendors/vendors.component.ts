import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxGalleryComponent, NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery-9';
import { Subject, Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { formatPhoneNumber, gallery_options, LanguageApp, MMDDYYYY_formet } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { ModeDetectService } from '../map/mode-detect.service';
import { Email } from '../portal-auth/models';
class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success margin-right-cust s2-confirm",
    denyButton: "btn btn-danger s2-confirm",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

@Component({
  selector: 'app-vendors',
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss']
})
export class VendorsComponent implements OnInit {
  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;

  @ViewChild("OpenFilebox") OpenFilebox: ElementRef<HTMLElement>;
  @ViewChild("gallery") gallery: NgxGalleryComponent;
  dtOptions: any = {};
  imageObject: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  termList = [];
  locallanguage: string;
  Vendor_VendorName: string;
  showTable: boolean = true;
  Vendor_Phone: string;
  Vendor_Email: string;
  Vendor_Address: string;
  Vendor_Action: string;
  Vendor_Attachments: string;
  Vendor_Status: string;
  Vendor_Description: string;
  Vendor_Terms: string;
  Customer_Id: string;
  Vendor_ID: string;
  Vendor_Do_Want_Archive: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";

  Listing_Action_Edit: string = "";
  Archived_all: string = "";
  acticve_word: string = "";
  inacticve_word: string = "";
  archivedIcon: string;
  mode: any;
  historyIcon: string;
  reportIcon: string;
  exportIcon: string;
  subscription: Subscription;
  copyDataFromProject: string = "";
  yesButton: string = "";
  noButton: string = "";
  editIcon: string;
  count = {
    active: 0, inactive: 0
  };

  constructor (private modeService: ModeDetectService,
    public dialog: MatDialog,
    private router: Router,
    private http: HttpClient,
    public httpCall: HttpCall,
    public uiSpinner: UiSpinnerService,
    public snackbarservice: Snackbarservice,
    public mostusedservice: Mostusedservice,
    public translate: TranslateService) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.reportIcon = icon.REPORT;
      this.historyIcon = icon.HISTORY;
      this.archivedIcon = icon.ARCHIVE;
      this.editIcon = icon.EDIT;

    } else {
      this.reportIcon = icon.REPORT_WHITE;
      this.historyIcon = icon.HISTORY_WHITE;
      this.archivedIcon = icon.ARCHIVE_WHITE;
      this.editIcon = icon.EDIT_WHITE;

    }
    let j = 0;
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.reportIcon = icon.REPORT;
        this.historyIcon = icon.HISTORY;
        this.archivedIcon = icon.ARCHIVE;
        this.editIcon = icon.EDIT;

      } else {
        this.mode = "on";
        this.reportIcon = icon.REPORT_WHITE;
        this.historyIcon = icon.HISTORY_WHITE;
        this.archivedIcon = icon.ARCHIVE_WHITE;
        this.editIcon = icon.EDIT_WHITE;

      }

      if (j != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 100);
      }
      j++;
    });
    let that = this;
    // this.uiSpinner.spin$.next(true);
    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant(
        "Copy_Data_From_Project"
      );
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
    });
  }

  ngOnInit(): void {
    const that = this;
    that.statusCount();
    that.getAllTerms();
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));

    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage =
      tmp_locallanguage == "" ||
        tmp_locallanguage == undefined ||
        tmp_locallanguage == null
        ? configdata.fst_load_lang
        : tmp_locallanguage;
    that.translate.use(this.locallanguage);
    let i = 0;
    this.translate.stream([""]).subscribe((textarray) => {
      that.acticve_word = this.translate.instant(
        "Team-EmployeeList-Status-Active"
      );
      that.inacticve_word = this.translate.instant("project_setting_inactive");
      that.Vendor_VendorName = that.translate.instant("Vendor_VendorName");
      that.Vendor_Phone = that.translate.instant("Vendor_Phone");
      that.Vendor_Email = that.translate.instant("Vendor_Email");
      that.Vendor_Address = that.translate.instant("Vendor_Address");
      that.Vendor_Action = that.translate.instant("Vendor_Action");
      that.Vendor_Attachments = that.translate.instant("Vendor_Attachments");
      that.Vendor_Status = that.translate.instant("Vendor_Status");
      that.Vendor_Description = that.translate.instant("Vendor_Description");
      that.Vendor_Terms = that.translate.instant("Vendor_Terms");
      that.Customer_Id = that.translate.instant("Customer_Id");
      that.Vendor_ID = that.translate.instant("Vendor_ID");
      that.Vendor_Do_Want_Archive = that.translate.instant(
        "Vendor_Do_Want_Archive"
      );
      that.Compnay_Equipment_Delete_Yes = that.translate.instant(
        "Compnay_Equipment_Delete_Yes"
      );
      that.Compnay_Equipment_Delete_No = that.translate.instant(
        "Compnay_Equipment_Delete_No"
      );

      that.Listing_Action_Edit = that.translate.instant("Listing_Action_Edit");
      that.Archived_all = that.translate.instant(
        "Archived_all"
      );
      if (this.locallanguage === "en") {
        this.locallanguage = "es";
      } else {
        this.locallanguage = "en";
      }
      if (i != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 1000);
      }
      i++;
    });

    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers = new HttpHeaders({ Authorization: token, language: portal_language, });
    let tmp_gallery = gallery_options();
    tmp_gallery.actions = [
      {
        icon: "fas fa-download",
        onClick: this.downloadButtonPress.bind(this),
        titleText: "download",
      },
    ];
    this.galleryOptions = [tmp_gallery];
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: false,
      language:
        portal_language == "en"
          ? LanguageApp.english_datatables
          : LanguageApp.spanish_datatables,
      order: [],
      ajax: (dataTablesParameters: any, callback) => {
        $(".dataTables_processing").html(
          "<img  src=" + this.httpCall.getLoader() + ">"
        );
        dataTablesParameters.is_delete = 0;
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.INVOICE_GET_VENDOR_DATATABLES,
            dataTablesParameters,
            { headers: headers }
          )
          .subscribe((resp) => {
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data,
            });
          });
      },
      columns: that.getColumName(),

      drawCallback: () => {
        $(".button_attachment").on("click", (event) => {
          this.imageObject = JSON.parse(
            event.target.getAttribute("edit_tmp_id")
          ).vendor_attachment;
          this.galleryImages = [];
          if (this.imageObject != undefined) {
            for (let i = 0; i < this.imageObject.length; i++) {
              var extension = this.imageObject[i].substring(
                this.imageObject[i].lastIndexOf(".") + 1
              );
              if (
                extension == "jpg" ||
                extension == "png" ||
                extension == "jpeg" ||
                extension == "gif" ||
                extension == "webp"
              ) {
                var srctmp: any = {
                  small: this.imageObject[i],
                  medium: this.imageObject[i],
                  big: this.imageObject[i],
                };
                this.galleryImages.push(srctmp);
              } else if (extension == "doc" || extension == "docx") {
                var srctmp: any = {
                  small:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
                  medium:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
                  big: "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
                };
                this.galleryImages.push(srctmp);
              } else if (extension == "pdf") {
                var srctmp: any = {
                  small:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
                  medium:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
                  big: "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
                };
                this.galleryImages.push(srctmp);
              } else if (extension == "odt") {
                var srctmp: any = {
                  small:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
                  medium:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
                  big: "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
                };
                this.galleryImages.push(srctmp);
              } else if (extension == "rtf") {
                var srctmp: any = {
                  small:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
                  medium:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
                  big: "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
                };
                this.galleryImages.push(srctmp);
              } else if (extension == "txt") {
                var srctmp: any = {
                  small:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
                  medium:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
                  big: "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
                };
                this.galleryImages.push(srctmp);
              } else if (extension == "ppt") {
                var srctmp: any = {
                  small:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
                  medium:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
                  big: "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
                };
                this.galleryImages.push(srctmp);
              } else if (
                extension == "xls" ||
                extension == "xlsx" ||
                extension == "csv"
              ) {
                var srctmp: any = {
                  small:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
                  medium:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
                  big: "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
                };
                this.galleryImages.push(srctmp);
              } else {
                var srctmp: any = {
                  small:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png",
                  medium:
                    "https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png",
                  big: "https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png",
                };
                this.galleryImages.push(srctmp);
              }
            }
          }
          setTimeout(() => {
            this.gallery.openPreview(0);
          }, 0);
        });
        $(".button_shiftEditClass").on("click", (event) => {
          // Edit Vendor here
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          this.router.navigate(["/vendor-form"], {
            queryParams: { _id: data._id },
          });
        });
        $(".button_shiftDeleteClass").on("click", (event) => {
          // Delete Vendor here
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          this.deleteVendor(data._id);
        });

        $(".call-active-inactive-api").on("click", (event) => {
          //Inactive vendor status  here
          this.changeStatus({
            _id: event.target.getAttribute("edit_tmp_id"),
            vendor_status: 2,
          });
        });

        $(".call-active-active-api").on("click", (event) => {
          //Active vendor status  here
          this.changeStatus({
            _id: event.target.getAttribute("edit_tmp_id"),
            vendor_status: 1,
          });
        });
      },
    };
  }
  getColumName() {
    let that = this;
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    return [
      {
        title: that.Vendor_VendorName,
        data: "vendor_name",
        defaultContent: "",
      },
      {
        title: that.Vendor_ID,
        data: "vendor_id",
        defaultContent: "",
      },
      {
        title: that.Customer_Id,
        data: "customer_id",
        defaultContent: "",
      },
      {
        title: that.Vendor_Phone,
        render: function (data: any, type: any, full: any) {
          return formatPhoneNumber(full.vendor_phone);
        },
      },
      {
        title: that.Vendor_Email,
        data: "vendor_email",
        defaultContent: "",
      },
      {
        title: that.Vendor_Address,
        data: "vendor_address",
        defaultContent: "",
      },
      {
        title: that.Vendor_Status,
        render: function (data: any, type: any, full: any) {
          var tmp_return;
          if (full.vendor_status == 1) {
            tmp_return =
              `<div class="active-chip-green call-active-inactive-api" edit_tmp_id=` +
              full._id +
              `><i  edit_tmp_id=` +
              full._id +
              ` class="fa fa-check cust-fontsize-right" aria-hidden="true"></i>` +
              that.acticve_word +
              `</div>`;
          } else {
            tmp_return =
              `<div class="inactive-chip-green call-active-active-api" edit_tmp_id=` +
              full._id +
              `><i  edit_tmp_id=` +
              full._id +
              ` class="fa fa-times cust-fontsize-right" aria-hidden="true"></i>` +
              that.inacticve_word +
              `</div>`;
          }
          return tmp_return;
        },
        width: "7%",
      },
      {
        title: that.Vendor_Attachments,
        render: function (data: any, type: any, full: any) {
          let htmlData = ``;
          if (full.vendor_attachment.length != 0) {
            htmlData =
              `<button  edit_tmp_id='` +
              JSON.stringify(full) +
              `' class="cusr-edit-btn-datatable button_attachment" aria-label="Left Align">
          <span class="fas fa-paperclip cust-fontsize-tmp"  edit_tmp_id='` +
              JSON.stringify(full) +
              `' aria-hidden="true"></span>
      </button> `;
          }
          return htmlData;
        },
        width: "1%",
        orderable: false,
      },
      {
        title: that.Vendor_Action,
        render: function (data: any, type: any, full: any) {
          let tmp_tmp = {
            _id: full._id,
          };
          if ("") {
            return (
              `
          <div class="dropdown">
            <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  aria-haspopup="true" aria-expanded="false"  edit_tmp_id='` + JSON.stringify(full) + `' aria-hidden="true"></i>
            <div class= "dropdown-content-cust" aria-labelledby="dropdownMenuButton">
              <a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_shiftEditClass" >` + '<img src="' + that.editIcon + '" alt="" height="15px">' + that.Listing_Action_Edit + `</a>
            </div>
        </div>`
            );
          } else {
            return (
              `
          <div class="dropdown">
            <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  aria-haspopup="true" aria-expanded="false"  edit_tmp_id='` +
              JSON.stringify(full) +
              `' aria-hidden="true"></i>
            <div class= "dropdown-content-cust" aria-labelledby="dropdownMenuButton">
              <a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_shiftEditClass" >` + '<img src="' + that.editIcon + '" alt="" height="15px">' + that.Listing_Action_Edit + `</a>
              <a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_shiftDeleteClass" >` + '<img src="' + that.archivedIcon + '" alt="" height="15px">' + that.Archived_all + `</a>
            </div>
        </div>`
            );
          }
        },
        width: "1%",
        orderable: false,
      },
    ];
  }
  // implement delete vendor api call
  deleteVendor(_id) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.Vendor_Do_Want_Archive,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: that.Compnay_Equipment_Delete_Yes,
        denyButtonText: that.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.httpCall
            .httpPostCall(httproutes.INVOICE_ARCHIVE_VENDOR, { _id: _id, is_delete: 1 })
            .subscribe(function (params) {
              if (params.status) {
                that.snackbarservice.openSnackBar(params.message, "success");
                that.rerenderfunc();
              } else {
                that.snackbarservice.openSnackBar(params.message, "error");
              }
            });
        }
      });
  }
  openVendorForm() {
    this.router.navigateByUrl('vendor-form');
  }
  openArchived() {
    this.router.navigateByUrl('vendor-archive');
  }
  downloadButtonPress(event, index): void {
    window.location.href = this.imageObject[index];
  }
  statusCount() {
    var that = this;
    that.httpCall
      .httpGetCall(httproutes.INVOICE_VENDOR_STATUS_COUNT,)
      .subscribe(function (data) {
        if (data.status) {
          that.count = data.data;
        }
      });
  }
  changeStatus(reqObject) {
    var that = this;
    that.uiSpinner.spin$.next(true);
    that.httpCall
      .httpPostCall(httproutes.INVOICE_CHANGE_VENDOR_STATUS, reqObject)
      .subscribe(function (data) {
        if (data) {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(data.message, "success");
          that.rerenderfunc();
        } else {
          that.uiSpinner.spin$.next(false);
          that.snackbarservice.openSnackBar(data.message, "error");
        }
      });
  }
  openHistoryDialog() {
    const dialogRef = this.dialog.open(VendorHistoryComponent, {
      height: "550px",
      width: "1000px",
      data: {
        // project_id: this.projectId,
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }
  openChangeVendorReportDialog() {
    const dialogRef = this.dialog.open(VendorReportComponent, {
      height: '500px',
      width: '800px',
      data: {
        termList: this.termList,

      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }
  getAllTerms() {
    let that = this;
    this.httpCall
      .httpGetCall(httproutes.OTHER_TERM_GET)
      .subscribe(function (params: any) {
        if (params.status) {
          that.termList = params.data;
        }

      });
  }

  rerenderfunc() {
    this.statusCount();
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    that.showTable = false;
    setTimeout(() => {
      that.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
      that.dtOptions.columns = that.getColumName();
      that.showTable = true;
    }, 100);
  }
}


@Component({
  selector: 'vendor-history',
  templateUrl: './vendor-history.html',
  styleUrls: ['./vendors.component.scss']
})
export class VendorHistoryComponent implements OnInit {
  id!: string;
  taskHistory = [];
  SearchIcon = icon.SEARCH_WHITE;
  start: number = 0;
  mode: any;
  exitIcon: string = "";
  search: string = "";
  is_httpCall: boolean = false;
  todayactivity_search!: String;
  activityIcon!: string;
  isSearch: boolean = false;
  subscription: Subscription;
  constructor (
    public httpCall: HttpCall,
    public snackbarservice: Snackbarservice,
    private modeService: ModeDetectService,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    console.log("history call");
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.exitIcon = icon.CANCLE;
    } else {
      this.exitIcon = icon.CANCLE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.exitIcon = icon.CANCLE;
      } else {
        this.mode = "on";
        this.exitIcon = icon.CANCLE_WHITE;
      }
    });
  }

  ngOnInit(): void {
    this.getTodaysActivity();
  }

  onKey(event: any) {
    console.log(event.target.value);
    if (event.target.value.length == 0) {
      console.log("emprty string");
      this.taskHistory = [];
      this.start = 0;
      this.getTodaysActivity();
    }
  }
  searchActivity() {
    console.log("searchTodayActivity");
    console.log("Entered email:", this.todayactivity_search);
    let that = this;
    that.isSearch = true;
    that.taskHistory = [];
    that.start = 0;
    this.getTodaysActivity();
  }

  onScroll() {
    this.start++;
    this.getTodaysActivity();
  }
  getTodaysActivity() {
    let self = this;
    this.is_httpCall = true;
    let requestObject = {};
    if (this.data.project_id) {
      requestObject = {
        start: this.start,
        search: this.todayactivity_search,
        project_id: this.data.project_id
      };
    } else {
      requestObject = {
        start: this.start,
        search: this.todayactivity_search,
      };
    }
    this.httpCall
      .httpPostCall(httproutes.INVOICE_GET_VENDOR_HISTORY, requestObject)
      .subscribe(function (params) {
        if (params.status) {
          if (self.start == 0)
            self.is_httpCall = false;
          self.taskHistory = self.taskHistory.concat(params.data);
        }
      });
  }

  tmp_date(epoch: any) {
    return MMDDYYYY_formet(epoch);
  }

  setHeightStyles() {
    let styles = {
      height: window.screen.height + "px",
      "overflow-y": "scroll",
    };
    return styles;
  }

}

@Component({
  selector: 'vendor-report',
  templateUrl: './vendor-report.html',
  styleUrls: ['./vendors.component.scss']
})
export class VendorReportComponent implements OnInit {
  public form: FormGroup;
  selectable = true;
  removable = true;
  addOnBlur = true;
  emailsList: any[] = [];
  vendorInfo: FormGroup;
  Report_File_Message: string = "";
  Report_File_Enter_Email: string = "";
  is_oneOnly: boolean = true;
  exitIcon: string;
  yesButton: string = "";
  noButton: string = "";
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = "";
  termList: any = [];
  saveIcon = icon.SAVE_WHITE;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;

  /*Constructor*/
  constructor (
    private formBuilder: FormBuilder,
    public httpCall: HttpCall,
    private modeService: ModeDetectService,
    public dialogRef: MatDialogRef<VendorReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public sb: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService
  ) {
    console.log("data2", data);
    this.termList = data.termList;
    this.Report_File_Message = this.translate.instant("Report_File_Message");
    this.Report_File_Enter_Email = this.translate.instant(
      "Report_File_Enter_Email"
    );
    this.vendorInfo = this.formBuilder.group({
      All_Terms: [true],
      terms_ids: [this.termList.map((el) => el._id)],
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.exitIcon = icon.CANCLE;
    } else {
      this.exitIcon = icon.CANCLE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.exitIcon = icon.CANCLE;
      } else {
        this.mode = "on";
        this.exitIcon = icon.CANCLE_WHITE;
      }
    });

    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant(
        "Copy_Data_From_Project"
      );
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
    });
  }

  /*
ngOnInit
*/
  ngOnInit(): void {
    let that = this;
    this.vendorInfo.get("terms_ids")
      .valueChanges.subscribe(function (params: any) {
        if (params.length == that.termList.length) {
          that.vendorInfo.get("All_Terms").setValue(true);
        } else {
          that.vendorInfo.get("All_Terms").setValue(false);
        }
      });
  }

  isValidMailFormat(value): any {
    var EMAIL_REGEXP =
      /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (value != "" && EMAIL_REGEXP.test(value)) {
      return { "Please provide a valid email": true };
    }
    return null;
  }

  addInternalEmail(event: MatChipInputEvent): void {
    const value = (event.value || "").trim();
    // Add email
    if (value) {
      var validEmail = this.isValidMailFormat(value);
      if (validEmail) {
        this.emailsList.push(value);
        // Clear the input value
        event.chipInput!.clear();
      } else {
        // here error for valid email
      }
    }
  }

  internalEmailremove(email: Email): void {
    //----
    let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    //----
    const index = this.emailsList.indexOf(email);
    if (index >= 0) {
      this.emailsList.splice(index, 1);
      //----
      if (email == user_data.UserData.useremail) {
        this.is_oneOnly = true;
      }
      //----
    }
  }

  onChangeValueAll_Terms(params) {
    if (params.checked) {
      this.vendorInfo
        .get("terms_ids")
        .setValue(this.termList.map((el) => el._id));
    } else {
      this.vendorInfo.get("terms_ids").setValue([]);
    }
  }


  /*
   *
   * save button action
   */
  saveData() {
    if (this.emailsList.length != 0) {
      this.uiSpinner.spin$.next(true);
      let requestObject = this.vendorInfo.value;
      var company_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
      requestObject.email_list = this.emailsList;
      requestObject.logo_url = company_data.companydata.companylogo;
      this.httpCall
        .httpPostCall(
          httproutes.INVOICE_GET_VENDOR_REPORT,
          requestObject
        )
        .subscribe(function (params: any) { });
      setTimeout(() => {
        this.uiSpinner.spin$.next(false);
        this.sb.openSnackBar(this.Report_File_Message, "success");
        this.dialogRef.close();
      }, 3000);
    } else {
      this.sb.openSnackBar(this.Report_File_Enter_Email, "error");
    }
  }

  /*
  Add my self button action
  */
  ADD_MY_SELF() {
    if (this.is_oneOnly) {
      let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
      this.emailsList.push(user_data.UserData.useremail);
      this.is_oneOnly = false;
    }
  }
}
