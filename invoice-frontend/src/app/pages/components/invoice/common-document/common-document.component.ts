import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { httproutes, icon, localstorageconstants, wasabiImagePath } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { MMDDYYYY_formet, commonLocalThumbImage, commonNetworkThumbImage, commonNewtworkAttachmentViewer } from 'src/app/service/utils';
import Swal from 'sweetalert2';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success s2-confirm margin-right-cust',
    denyButton: 'btn btn-danger',
    cancelButton: 's2-confirm btn btn-gray ml-2',

  },
  buttonsStyling: false,
  imageUrl: './assets/logo/invoice_logo.png',
  imageHeight: 50,
  imageAlt: 'A branding image'
});
@Component({
  selector: 'app-common-document',
  templateUrl: './common-document.component.html',
  styleUrls: ['./common-document.component.scss']
})
export class CommonDocumentComponent implements OnInit {
  @Input() data: any;
  @Input() module: any;
  @ViewChild("gallery") gallery: NgxGalleryComponent;
  @Output() documentUpdate: EventEmitter<void> = new EventEmitter<void>();
  hideToggle = false;
  hide: Boolean = true;
  disabled = false;
  multi = false;
  displayMode: string = 'default';
  role_permission: any;
  invoiceNoteform: FormGroup;
  notesList: any = [];
  show_Nots: boolean = false;
  last_files_array: any = [];

  files_old: any = [];
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  saveIcon = icon.SAVE_WHITE;
  galleryOptions: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  isSearch: boolean = false;
  yesButton: string;
  noButton: string;
  Remove_Notes: string;
  id: any;
  LOCAL_OFFSET: number;

  constructor(public dialog: MatDialog, private formBuilder: FormBuilder, private sanitiser: DomSanitizer, public uiSpinner: UiSpinnerService, public httpCall: HttpCall, public snackbarservice: Snackbarservice, public translate: TranslateService, public route: ActivatedRoute,) {
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    this.role_permission = this.role_permission.role_permission;
    this.translate.stream([""]).subscribe((textarray) => {

      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      this.Remove_Notes = this.translate.instant("Remove_Notes");

    });

    this.id = this.route.snapshot.queryParamMap.get('_id');

  }

  ngOnInit(): void {
    let that = this;
    that.notesList = that.data.invoice_notes;
    that.last_files_array = that.data.invoice_attachments;
    that.files_old = [];
    for (let loop_i = 0; loop_i < that.data.invoice_attachments.length; loop_i++) {
      that.files_old.push(that.data.invoice_attachments[loop_i]);
    }
    that.last_files_array = that.data.invoice_attachments;
    that.invoiceNoteform = this.formBuilder.group({
      notes: [""],

    });


    console.log("data", this.data);
  }
  saveNotes() {

    let that = this;
    this.invoiceNoteform.markAllAsTouched();
    if (that.invoiceNoteform.valid) {
      let req_temp = that.invoiceNoteform.value;
      req_temp.invoice_id = this.id;
      that.uiSpinner.spin$.next(true);
      that.httpCall.httpPostCall(httproutes.PORTAL_SAVE_INVOICE_NOTES, req_temp).subscribe(function (params_new) {
        if (params_new.status) {

          that.snackbarservice.openSnackBar(params_new.message, "success");
          that.uiSpinner.spin$.next(false);
          that.invoiceNoteform.reset();
          that.show_Nots = false;
          that.documentUpdate.emit();
        } else {
          that.snackbarservice.openSnackBar(params_new.message, "error");
          that.uiSpinner.spin$.next(false);
        }
      });
    }


  }
  deleteNote(_id) {
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
              invoice_id: that.id
            })
            .subscribe(function (params) {
              that.uiSpinner.spin$.next(false);
              if (params.status) {

                that.snackbarservice.openSnackBar(params.message, "success");
                that.dialog.closeAll();
                that.documentUpdate.emit();
              } else {
                that.snackbarservice.openSnackBar(params.message, "error");
              }
            });
        }
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

          reqObject._id = that.id;
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
                that.uiSpinner.spin$.next(false);
                that.documentUpdate.emit();
              } else {
                that.snackbarservice.openSnackBar(
                  params_new.message,
                  "error"
                );
                that.uiSpinner.spin$.next(false);
              }
            });
        }


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

          reqObject._id = that.id;
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
                that.uiSpinner.spin$.next(false);
                that.documentUpdate.emit();
              } else {
                that.snackbarservice.openSnackBar(
                  params_new.message,
                  "error"
                );
                that.uiSpinner.spin$.next(false);
              }
            });
        }


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




  temp_MMDDYYY_format(epoch) {
    return MMDDYYYY_formet(epoch);
  }
  addNotes() {
    this.show_Nots = true;
  }

  thumbImage(file) {
    return commonLocalThumbImage(this.sanitiser, file);
  }

  thumbNetworkImage(index) {
    return commonNetworkThumbImage(this.last_files_array[index]);
  }

  downloadButtonPress(event, index): void {
    window.location.href = this.files_old[index];
  }

  imageNetworkPreview(allAttachment, index) {
    this.galleryImages = commonNewtworkAttachmentViewer(allAttachment);
    setTimeout(() => {
      this.gallery.openPreview(index);
    }, 0);
  }

}
