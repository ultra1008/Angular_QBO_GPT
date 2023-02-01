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
import { ModeDetectService } from '../../map/mode-detect.service';
import { Location } from '@angular/common';

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
  selector: 'app-dashboard-files-list',
  templateUrl: './dashboard-files-list.component.html',
  styleUrls: ['./dashboard-files-list.component.scss']
})
export class DashboardFilesListComponent implements OnInit {
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
  showTable: boolean = true;
  invoice_no: string;
  po_no: string;
  packing_slip_no: string;
  Receiving_Slip: string;
  Receiving_Attachment: string;
  Vendor_Action: string;
  Vendor_Status: string;
  template_notes: string;

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
  backIcon: string;
  counts: any = {
    pending_files: 0,
    pending_invoices: 0,
    approved_invoices: 0,
    rejected_invoices: 0,
    late_invoices: 0,
  };


  constructor(private location: Location, private modeService: ModeDetectService,
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
      this.backIcon = icon.BACK;
    } else {
      this.reportIcon = icon.REPORT_WHITE;
      this.backIcon = icon.BACK_WHITE;
    }
    let j = 0;
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.reportIcon = icon.REPORT;
        this.backIcon = icon.BACK;
      } else {
        this.mode = "on";
        this.reportIcon = icon.REPORT_WHITE;
        this.backIcon = icon.BACK_WHITE;
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

  back() {
    this.location.back();
  }

  ngOnInit(): void {
    const that = this;

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
      that.invoice_no = that.translate.instant("invoice_no");
      that.po_no = that.translate.instant("po_no");
      that.packing_slip_no = that.translate.instant("packing_slip_no");
      that.Receiving_Slip = that.translate.instant("Receiving_Slip");
      that.Vendor_Action = that.translate.instant("Vendor_Action");
      that.Receiving_Attachment = that.translate.instant("Receiving_Attachment");
      that.Vendor_Status = that.translate.instant("Vendor_Status");
      that.template_notes = that.translate.instant("template_notes");

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
          ).attachment;
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

        });


      },
    };
  }
  getColumName() {
    let that = this;
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    return [
      {
        title: that.invoice_no,
        data: "vendor_name",
        defaultContent: "",
      },
      {
        title: that.po_no,
        data: "vendor_id",
        defaultContent: "",
      },

      {
        title: that.packing_slip_no,
        data: "email",
        defaultContent: "",
      },
      {
        title: that.Receiving_Slip,
        data: "address",
        defaultContent: "",
      },
      {
        title: that.Vendor_Status,
        render: function (data: any, type: any, full: any) {
          var tmp_return;
          if (full.status == 1)
            tmp_return =
              `<div class="active-chip-green call-active-inactive-api" edit_tmp_id=` +
              full._id +
              `><i  edit_tmp_id=` +
              full._id +
              ` class="fa fa-check cust-fontsize-right" aria-hidden="true"></i>` +
              that.acticve_word +
              `</div>`;
          else
            tmp_return =
              `<div class="inactive-chip-green call-active-active-api" edit_tmp_id=` +
              full._id +
              `><i  edit_tmp_id=` +
              full._id +
              ` class="fa fa-times cust-fontsize-right" aria-hidden="true"></i>` +
              that.inacticve_word +
              `</div>`;
          return tmp_return;
        },
        width: "7%",
      },
      {
        title: that.Receiving_Attachment,
        render: function (data: any, type: any, full: any) {
          let htmlData = ``;
          if (full.attachment.length != 0) {
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

  // openVendorForm() {
  //   this.router.navigateByUrl('vendor-form');
  // }
  // openArchived() {
  //   this.router.navigateByUrl('vendor-archive');
  // }
  downloadButtonPress(event, index): void {
    window.location.href = this.imageObject[index];
  }
  rerenderfunc() {
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

