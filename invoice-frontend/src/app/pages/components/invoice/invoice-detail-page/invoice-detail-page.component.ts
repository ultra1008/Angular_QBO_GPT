import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatAccordion } from '@angular/material/expansion';
import { MatTreeFlattener, MatTreeFlatDataSource } from '@angular/material/tree';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants, wasabiImagePath } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Location } from '@angular/common';
import { gallery_options, MMDDYYYY, MMDDYYYY_formet, updatecurrantTimeInDate } from 'src/app/service/utils';
import { FormBuilder, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment';
import { InvoiceHistoryComponent } from '../invoice-form/invoice-form.component';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success s2-confirm margin-right-cust',
    denyButton: 'btn btn-danger',
    cancelButton: 's2-confirm btn btn-gray ml-2'
  },
  buttonsStyling: false
});
@Component({
  selector: 'app-invoice-detail-page',
  templateUrl: './invoice-detail-page.component.html',
  styleUrls: ['./invoice-detail-page.component.scss']
})
export class InvoiceDetailPageComponent implements OnInit {
  @ViewChild(MatAccordion) accordion: MatAccordion;

  displayMode: string = 'default';
  placeholderIcon: icon.PHOTO_PLACEHOLDER;
  show_tabs: boolean = true;
  hideToggle = false;
  disabled = false;
  pdf_url = '';
  multi = false;
  hide: Boolean = true;
  backIcon: string;
  downloadIcon: string;
  printIcon: string;
  editIcon: string;
  subscription: Subscription;
  mode: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  saveIcon = icon.SAVE_WHITE;
  id: any;
  invoiceData: any;
  loadInvoice: boolean = false;
  has_packing_slip: any = [];
  notsList: any = [];
  invoiceNoteform: FormGroup;
  poDocumentType = 'PO';
  packingSlipDocumentType = 'Packing Slip';
  receivingSlipDocumentType = 'Receiving Slip';
  quoteoDocumentType = 'Quote';
  invoice_id: any;
  documentTypes: any = {
    po: 'PO',
    packingSlip: 'Packing Slip',
    receivingSlip: 'Receiving Slip',
    quote: 'Quote',
  };
  dashboardHistory = [];
  SearchIcon = icon.SEARCH_WHITE;
  start: number = 0;
  exitIcon: string = "";
  search: string = "";
  is_httpCall: boolean = false;
  todayactivity_search!: String;
  activityIcon!: string;
  isSearch: boolean = false;
  yesButton: string;
  noButton: string;
  Remove_Notes: string;
  show_Nots: boolean = false;
  @ViewChild("gallery") gallery: NgxGalleryComponent;
  filepath: any;
  last_files_array: any = [];
  files_old: any = [];
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  datefrompicker = new Date();
  _id: string;
  LOCAL_OFFSET: number;
  historyIcon: string;



  constructor(private sanitiser: DomSanitizer, private formBuilder: FormBuilder, public dialog: MatDialog, private location: Location, private modeService: ModeDetectService, private router: Router, public route: ActivatedRoute, public uiSpinner: UiSpinnerService, public httpCall: HttpCall,
    public snackbarservice: Snackbarservice, public translate: TranslateService,) {
    this.translate.stream([""]).subscribe((textarray) => {

      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      this.Remove_Notes = this.translate.instant("Remove_Notes");
    });
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.invoice_id = this.id;
    this._id = this.id;



    if (this.mode == "off") {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.backIcon = icon.BACK;
      this.exitIcon = icon.CANCLE;
      this.historyIcon = icon.HISTORY;
    } else {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.backIcon = icon.BACK_WHITE;
      this.exitIcon = icon.CANCLE_WHITE;
      this.historyIcon = icon.HISTORY_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.backIcon = icon.BACK;
        this.exitIcon = icon.CANCLE;
        this.historyIcon = icon.HISTORY;
      } else {
        this.mode = "on";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.backIcon = icon.BACK_WHITE;
        this.exitIcon = icon.CANCLE_WHITE;
        this.historyIcon = icon.HISTORY_WHITE;
      }
    });
    if (this.id) {
      this.uiSpinner.spin$.next(true);
      this.getOneInvoice();
    }

  }

  ngOnInit(): void {
    this.getTodaysActivity();
    let tmp_gallery = gallery_options();
    tmp_gallery.actions = [
      {
        icon: "fas fa-download",
        onClick: this.downloadButtonPress.bind(this),
        titleText: "download",
      },
    ];
    this.galleryOptions = [tmp_gallery];
    this.invoiceNoteform = this.formBuilder.group({
      notes: [""],

    });
  }
  // invoice attchment
  saveAttchment() {
    let that = this;
    let reqObject = {
      // _id: this._id,
      _id: "",
      invoice_attachments: "",
    };
    const formData = new FormData();
    for (var i = 0; i < that.files.length; i++) {
      formData.append("file[]", that.files[i]);
    } formData.append("dir_name", wasabiImagePath.INVOICE_ATTCHMENT);
    formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));
    that.uiSpinner.spin$.next(true);
    reqObject["local_offset"] = that.LOCAL_OFFSET;
    that.httpCall
      .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
      .subscribe(function (params) {
        if (params.status) {

          reqObject._id = that._id;
          reqObject.invoice_attachments = params.data.concat(
            that.last_files_array
          );
          that.httpCall.httpPostCall(httproutes.PORTAL_INVOICE_ATTCHMENTS, reqObject)
            .subscribe(function (params_new) {
              if (params_new.status) {
                that.snackbarservice.openSnackBar(
                  params_new.message,
                  "success"
                );
                that.files = [];
                that.files_old = [];
                that.last_files_array = [];
                that.getOneInvoice();
                that.uiSpinner.spin$.next(false);
              } else {
                that.snackbarservice.openSnackBar(
                  params_new.message,
                  "error"
                );
                that.uiSpinner.spin$.next(false);
              }
            });
        }
        console.log("params", params);

      });
  }



  files: File[] = [];

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  deleteFile_old(index: number) {
    console.log("index", index);
    this.last_files_array.splice(index, 1);
    this.files_old.splice(index, 1);
    let that = this;
    let reqObject = {
      // _id: this._id,
      _id: "",
      invoice_attachments: "",
    };
    const formData = new FormData();
    for (var i = 0; i < that.files.length; i++) {
      formData.append("file[]", that.files[i]);
    } formData.append("dir_name", wasabiImagePath.INVOICE_ATTCHMENT);
    formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));
    that.uiSpinner.spin$.next(true);
    reqObject["local_offset"] = that.LOCAL_OFFSET;
    that.httpCall
      .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
      .subscribe(function (params) {
        if (params.status) {

          reqObject._id = that._id;
          reqObject.invoice_attachments = that.last_files_array;
          that.httpCall.httpPostCall(httproutes.PORTAL_INVOICE_ATTCHMENTS, reqObject)
            .subscribe(function (params_new) {
              if (params_new.status) {
                that.snackbarservice.openSnackBar(
                  params_new.message,
                  "success"
                );
                that.files = [];
                that.files_old = [];
                that.last_files_array = [];
                that.getOneInvoice();
                that.uiSpinner.spin$.next(false);
              } else {
                that.snackbarservice.openSnackBar(
                  params_new.message,
                  "error"
                );
                that.uiSpinner.spin$.next(false);
              }
            });
        }
        console.log("params", params);

      });


  }
  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  thumbImage(file) {
    switch (file.type) {
      case "application/pdf":
        return "../../../../../../assets/images/pdf.png";
        break;

      case "image/png":
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case "image/jpeg":
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case "image/jpg":
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case "image/gif":
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case "application/msword":
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "../../../../../../assets/images/doc.png";
        break;

      case "application/vnd.ms-excel":
      case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
        return "../../../../../../assets/images/xls.png";
        break;

      case "application/vnd.oasis.opendocument.text":
        return "../../../../../../assets/images/odt.png";
        break;

      case "application/zip":
        return "../../../../../../assets/images/zip.png";
        break;

      case "image/svg+xml":
        return "../../../../../../assets/images/svg.png";
        break;

      case "text/plain":
        return "../../../../../../assets/images/txt.png";
        break;

      case "application/vnd.ms-powerpoint":
        return "../../../../../../assets/images/ppt.png";
        break;

      default:
        return "../../../../../../assets/images/no-preview.png";
        break;
    }
  }

  thumbNetworkImage(index) {
    var extension = this.files_old[index].substring(
      this.files_old[index].lastIndexOf(".") + 1
    );

    if (extension == "doc" || extension == "docx") {
      return "https://s3.us-west-1.wasabisys.com/rovukdata/doc.png";
    } else if (extension == "pdf") {
      return "https://s3.us-west-1.wasabisys.com/rovukdata/pdf.png";
    } else if (
      extension == "xls" ||
      extension == "xlsx" ||
      extension == "csv"
    ) {
      return "https://s3.us-west-1.wasabisys.com/rovukdata/xls.png";
    } else if (extension == "zip") {
      return "https://s3.us-west-1.wasabisys.com/rovukdata/zip.png";
    } else if (extension == "ppt") {
      return "https://s3.us-west-1.wasabisys.com/rovukdata/ppt.png";
    } else if (extension == "rtf") {
      return "https://s3.us-west-1.wasabisys.com/rovukdata/rtf.png";
    } else if (extension == "odt") {
      return "https://s3.us-west-1.wasabisys.com/rovukdata/odt.png";
    } else if (extension == "txt") {
      return "https://s3.us-west-1.wasabisys.com/rovukdata/txt.png";
    } else if (extension == "svg") {
      return "https://s3.us-west-1.wasabisys.com/rovukdata/svg.png";
    } else {
      return this.files_old[index];
    }
  }

  downloadButtonPress(event, index): void {
    window.location.href = this.files_old[index];
  }

  imageNetworkPreview(allAttachment, index) {
    this.galleryImages = [];
    for (let i = 0; i < allAttachment.length; i++) {
      var extension = allAttachment[i]
        .substring(allAttachment[i].lastIndexOf(".") + 1)
        .toLowerCase();
      if (
        extension == "jpg" ||
        extension == "png" ||
        extension == "jpeg" ||
        extension == "gif" ||
        extension == "webp"
      ) {
        var srctmp: any = {
          small: allAttachment[i],
          medium: allAttachment[i],
          big: allAttachment[i],
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "doc" || extension == "docx") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "pdf") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "odt") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "rtf") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "txt") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "ppt") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
        };
        this.galleryImages.push(srctmp);
      } else if (
        extension == "xls" ||
        extension == "xlsx" ||
        extension == "csv"
      ) {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "zip") {
        var srctmp: any = {
          small: "https://s3.us-west-1.wasabisys.com/rovukdata/zip_big.png",
          medium: "https://s3.us-west-1.wasabisys.com/rovukdata/zip_big.png",
          big: "https://s3.us-west-1.wasabisys.com/rovukdata/zip_big.png",
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
    setTimeout(() => {
      this.gallery.openPreview(index);
    }, 0);
  }
  // End invoice attchment

  // invoice nots
  addNotes() {
    this.show_Nots = true;
  }
  saveNotes() {
    console.log("call");
    let that = this;
    this.invoiceNoteform.markAllAsTouched();
    if (that.invoiceNoteform.valid) {
      let req_temp = that.invoiceNoteform.value;
      req_temp.invoice_id = this.invoice_id;
      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.PORTAL_SAVE_INVOICE_NOTES, req_temp).subscribe(function (params_new) {
        if (params_new.status) {

          that.snackbarservice.openSnackBar(params_new.message, "success");
          that.uiSpinner.spin$.next(false);
          that.invoiceNoteform.reset();
          that.show_Nots = false;
          that.getOneInvoice();


        } else {
          that.snackbarservice.openSnackBar(params_new.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
    }


  }
  deleteNote(_id, invoice_id) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: that.Remove_Notes,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.yesButton,
        denyButtonText: this.noButton,

      })
      .then((result) => {
        if (result.isConfirmed) {
          this.uiSpinner.spin$.next(true);
          that.httpCall
            .httpPostCall(httproutes.PORTAL_DELETE_INVOICE_NOTES, {
              _id: _id,
              invoice_id: invoice_id
            })
            .subscribe(function (params) {
              that.uiSpinner.spin$.next(false);
              if (params.status) {

                that.snackbarservice.openSnackBar(params.message, "success");
                that.dialog.closeAll();
                that.getOneInvoice();
              } else {
                that.snackbarservice.openSnackBar(params.message, "error");
              }
            });
        }
      });
  }

  getOneInvoice() {
    let that = this;
    that.httpCall
      .httpPostCall(httproutes.INVOICE_GET_ONE_INVOICE, { _id: that.id })
      .subscribe(function (params) {
        if (params.status) {
          that.invoiceData = params.data;
          that.has_packing_slip = that.invoiceData.has_packing_slip;
          that.notsList = that.invoiceData.invoice_notes;
          that.files_old = [];
          for (let loop_i = 0; loop_i < params.data.invoice_attachments.length; loop_i++) {
            that.files_old.push(params.data.invoice_attachments[loop_i]);
          }
          that.last_files_array = that.invoiceData.invoice_attachments;

          that.loadInvoice = true;
          that.uiSpinner.spin$.next(false);
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }

        console.log("last_files_array", that.last_files_array);
      });
  }

  goToInvoiceEdit(invoiceData) {
    this.router.navigate(['/invoice-form'], { queryParams: { _id: invoiceData._id } });

  }
  back() {
    this.location.back();
  }
  print() {
    fetch(this.invoiceData.pdf_url).then(resp => resp.arrayBuffer()).then(resp => {
      /*--- set the blog type to final pdf ---*/
      const file = new Blob([resp], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(file);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);
      //iframe.contentWindow.print();
      iframe.onload = () => {
        setTimeout(() => {
          iframe.focus();
          iframe.contentWindow!.print();
        });
      };
    });
  }

  download() {
    let a = document.createElement('a');
    /*--- Firefox requires the link to be in the body --*/
    document.body.appendChild(a);
    a.style.display = 'none';
    a.target = "_blank";
    a.href = this.invoiceData.pdf_url;
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }
  onKey(event: any) {
    console.log(event.target.value);
    if (event.target.value.length == 0) {
      console.log("emprty string");
      this.dashboardHistory = [];
      this.start = 0;
      this.getTodaysActivity();
    }
  }
  searchActivity() {
    console.log("searchTodayActivity");
    console.log("Entered email:", this.todayactivity_search);
    let that = this;
    that.isSearch = true;
    that.dashboardHistory = [];
    that.start = 0;
    this.getTodaysActivity();
  }

  onScroll() {
    this.start++;
    this.getTodaysActivity();
  }
  // getTodaysActivity() {
  //   console.log("callllll");
  //   let self = this;

  //   // let requestObject = { start: this.start };

  //   self.httpCall
  //     .httpPostCall(httproutes.INVOICE_GET_DASHBOARD_HISTORY,
  //       { start: 0 })
  //     .subscribe(function (params) {
  //       console.log("dashboardHistory", params);
  //       if (params.status) {
  //         if (self.start == 0)

  //           self.dashboardHistory = self.dashboardHistory.concat(params.data);
  //         console.log("dashboardHistory", self.dashboardHistory);
  //       }

  //     });

  // }
  temp_MMDDYYY_format(epoch) {
    return MMDDYYYY_formet(epoch);
  }
  openHistoryDialog() {
    const dialogRef = this.dialog.open(InvoiceHistoryComponent, {
      height: "550px",
      width: "1000px",
      data: {
        // project_id: this.projectId,
      },
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => { });
  }
  getTodaysActivity() {
    let self = this;
    this.is_httpCall = true;
    let requestObject = {};
    requestObject = {
      start: this.start,
      _id: this.id

    };
    this.httpCall
      .httpPostCall(httproutes.INVOICE_GET_INVOICE_HISTORY, requestObject)
      .subscribe(function (params) {
        if (params.status) {
          if (self.start == 0)
            self.is_httpCall = false;
          self.dashboardHistory = self.dashboardHistory.concat(params.data);
        }
        console.log("dashboardHistory", self.dashboardHistory);
      });
  }


}





