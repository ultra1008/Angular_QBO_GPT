import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { commonFileChangeEvent, gallery_options, MMDDYYYY } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import { ModeDetectService } from '../../map/mode-detect.service';

import * as _ from 'lodash';
import Swal from 'sweetalert2';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success s2-confirm margin-right-cust',
    denyButton: 'btn btn-danger',
    cancelButton: 's2-confirm btn btn-gray ml-2'
  },
  buttonsStyling: false
});

@Component({
  selector: 'app-invoice-other-document',
  templateUrl: './invoice-other-document.component.html',
  styleUrls: ['./invoice-other-document.component.scss']
})
export class InvoiceOtherDocumentComponent implements OnInit {
  @Input() documentType: any;

  hideToggle = false;
  disabled = false;
  displayMode: string = 'default';
  pdf_url = '';
  multi = false;
  hide: Boolean = true;
  downloadIcon: string;
  printIcon: string;
  editIcon: string;
  subscription: Subscription;
  mode: any;
  // show_pdf: Boolean = false;
  documentTypes: any = {
    po: 'PO',
    packingSlip: 'Packing Slip',
    receivingSlip: 'Receiving Slip',
    quote: 'Quote',
  };
  invoiceData: any;
  loadInvoice: boolean = false;
  id: any;
  has_document: boolean = false;
  otherDocument: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  saveIcon = icon.SAVE_WHITE;
  yesButton: string;
  noButton: string;
  Remove_Notes: string;

  notesList: any = [];
  atchmentList: any = [];
  show_Nots: boolean = false;
  otherDocumentNoteform: FormGroup;
  invoice_id: any;

  constructor(public translate: TranslateService, private formBuilder: FormBuilder, public snackbarservice: Snackbarservice, public httpCall: HttpCall, public uiSpinner: UiSpinnerService, public dialog: MatDialog, private router: Router, private modeService: ModeDetectService, public route: ActivatedRoute,) {
    this.id = this.route.snapshot.queryParamMap.get('_id');
    this.invoice_id = this.id;
    this.translate.stream([""]).subscribe((textarray) => {

      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      this.Remove_Notes = this.translate.instant("Remove_Notes");
    });
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";

    if (this.mode == "off") {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
    } else {
      this.downloadIcon = icon.DOWNLOAD_WHITE;
      this.printIcon = icon.PRINT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
      } else {
        this.mode = "on";
        this.downloadIcon = icon.DOWNLOAD_WHITE;
        this.printIcon = icon.PRINT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
      }
    });
  }

  ngOnInit(): void {
    this.getOneInvoice();
    this.otherDocumentNoteform = this.formBuilder.group({
      notes: [""],

    });
  }
  goToEdit() {
    let that = this;
    console.log("sdafdsf", that.documentType, that.documentTypes);
    if (that.documentType == that.documentTypes.po) {
      that.router.navigate(['/po-detail-form']);
    } else if (that.documentType == that.documentTypes.packingSlip) {
      that.router.navigate(['/packing-slip-form']);
    } else if (that.documentType == that.documentTypes.receivingSlip) {
      that.router.navigate(['/receiving-slip-form']);
    } else if (that.documentType == that.documentTypes.quote) {
      that.router.navigate(['/quote-detail-form']);
    }

  }
  addNotes() {
    this.show_Nots = true;
  }
  temp_MMDDYYY(epoch) {
    return MMDDYYYY(epoch);
  }
  saveNotes() {
    let document_Url;
    console.log("call");
    let that = this;
    this.otherDocumentNoteform.markAllAsTouched();
    if (that.otherDocumentNoteform.valid) {
      let req_temp = that.otherDocumentNoteform.value;
      req_temp.invoice_id = this.invoice_id;
      that.uiSpinner.spin$.next(true);
      if (that.documentType == that.documentTypes.po) {
        document_Url = httproutes.PORTAL_SAVE_P_O_NOTES;
      } else if (that.documentType == that.documentTypes.packingSlip) {
        document_Url = httproutes.PORTAL_SAVE_PACKING_SLIP_NOTES;
      } else if (that.documentType == that.documentTypes.receivingSlip) {
        document_Url = httproutes.PORTAL_SAVE_Receiving_Slip_NOTES;
      } else if (that.documentType == that.documentTypes.quote) {
        document_Url = httproutes.PORTAL_SAVE_Quote_NOTES;
      }


      that.httpCall.httpPostCall(document_Url, req_temp).subscribe(function (params_new) {
        if (params_new.status) {

          that.snackbarservice.openSnackBar(params_new.message, "success");
          that.uiSpinner.spin$.next(false);
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
    let document_Delet_Url;
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
          if (that.documentType == that.documentTypes.po) {
            document_Delet_Url = httproutes.PORTAL_DELETE_P_O_NOTES;
          } else if (that.documentType == that.documentTypes.packingSlip) {
            document_Delet_Url = httproutes.PORTAL_DELETE_PACKING_SLIP_NOTES;
          } else if (that.documentType == that.documentTypes.receivingSlip) {
            document_Delet_Url = httproutes.PORTAL_DELETE_Receiving_Slip_NOTES;
          } else if (that.documentType == that.documentTypes.quote) {
            document_Delet_Url = httproutes.PORTAL_DELETE_Quote_NOTES;
          }
          that.httpCall
            .httpPostCall(document_Delet_Url, {
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
          if (that.documentType == that.documentTypes.po) {
            that.has_document = params.data.has_po;
            that.otherDocument = params.data.po_data;
            that.notesList = that.invoiceData.po_notes;
          } else if (that.documentType == that.documentTypes.packingSlip) {
            that.has_document = params.data.has_packing_slip;
            that.otherDocument = params.data.packing_slip_data;
            that.notesList = that.invoiceData.packing_slip_notes;
            that.atchmentList = that.invoiceData.packing_slip_notes;
          } else if (that.documentType == that.documentTypes.receivingSlip) {
            that.has_document = params.data.has_packing_slip;
            that.otherDocument = params.data.packing_slip_data;
            that.notesList = that.invoiceData.packing_slip_notes;
          } else if (that.documentType == that.documentTypes.quote) {
            that.has_document = params.data.has_quote;
            that.otherDocument = params.data.quote_data;
            that.notesList = that.invoiceData.quote_notes;
          }

          that.loadInvoice = true;
          that.uiSpinner.spin$.next(false);
        } else {
          that.snackbarservice.openSnackBar(params.message, "error");
          that.uiSpinner.spin$.next(false);
        }
        console.log("notesList", that.notesList);
      });
  }
  print() {
    fetch(this.pdf_url).then(resp => resp.arrayBuffer()).then(resp => {
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
  openAddDialog() {
    let that = this;
    const dialogRef = this.dialog.open(AddOtherFiles, {
      height: '400px',
      width: '700px',
      data: {},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      // that.getAllInvoices();
    });
  }
  openOrphanFilesDialog() {
    let that = this;
    const dialogRef = this.dialog.open(OrphanFiles, {
      height: "550px",
      width: "750px",
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result) => {
      // that.employeeservice.getalluser().subscribe(function (data) {
      //   if (data.status) {
      //     that.usersArray = data.data;

      //   }
      // });
    });
  }


  download() {
    let a = document.createElement('a');
    /*--- Firefox requires the link to be in the body --*/
    document.body.appendChild(a);
    a.style.display = 'none';
    a.target = "_blank";
    a.href = this.pdf_url;
    a.click();
    /*--- Remove the link when done ---*/
    document.body.removeChild(a);
  }
}

@Component({
  selector: 'add-other-files',
  templateUrl: './add-other-files.html',
  styleUrls: ['./invoice-other-document.component.scss']
})
export class AddOtherFiles implements OnInit {
  @ViewChild('gallery')
  gallery!: NgxGalleryComponent;

  public form: any;
  selectedStatus: any;
  files_old: any = [];
  last_files_array: any = [];
  galleryOptions!: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  saveIcon: string;
  emailsList: any[] = [];
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  Report_File_Message: string = "";
  Report_File_Enter_Email: string = "";
  exitIcon: string;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  _id!: string;
  fileIcon: string = "";
  FILE_NOT_SUPPORTED: string;
  Invoice_Add_Atleast_One_Document: string = '';

  constructor(private modeService: ModeDetectService, private formBuilder: FormBuilder, public httpCall: HttpCall,
    public dialogRef: MatDialogRef<AddOtherFiles>,
    @Inject(MAT_DIALOG_DATA) public data: any, public sb: Snackbarservice, public translate: TranslateService, public dialog: MatDialog, private sanitiser: DomSanitizer,
    public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService,
    private router: Router, public route: ActivatedRoute, public spinner: UiSpinnerService,) {

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.exitIcon = icon.CANCLE;
      this.saveIcon = icon.SAVE_WHITE;
      this.fileIcon = icon.REPORT;

    } else {
      this.exitIcon = icon.CANCLE_WHITE;
      this.saveIcon = icon.SAVE_WHITE;
      this.fileIcon = icon.REPORT_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.exitIcon = icon.CANCLE;
        this.saveIcon = icon.SAVE_WHITE;
        this.fileIcon = icon.REPORT;

      } else {
        this.mode = 'on';
        this.exitIcon = icon.CANCLE_WHITE;
        this.saveIcon = icon.SAVE_WHITE;
        this.fileIcon = icon.REPORT_WHITE;

      }
      console.log("DARK MODE: " + this.mode);

    });
    this.translate.stream([""]).subscribe((textarray) => {
      this.FILE_NOT_SUPPORTED = this.translate.instant("FILE_NOT_SUPPORTED");
      this.Invoice_Add_Atleast_One_Document = this.translate.instant('Invoice_Add_Atleast_One_Document');
    });

  }
  ngOnInit(): void {
    let tmp_gallery = gallery_options();
    this.galleryOptions = [
      tmp_gallery
    ];
  }


  files: File[] = [];


  /**
   * on file drop handler
   */
  onFileDropped($event: any[]) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files: any) {
    commonFileChangeEvent(files, "pdf").then((result: any) => {
      if (result.status) {
        this.prepareFilesList(files.target.files);
      } else {
        this.snackbarservice.openSnackBar(this.FILE_NOT_SUPPORTED, "error");
      }
    });

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



  /*
    This method is used to display thumb image from local file.
    File/Image picker item is diplayed thmb based on file extensions.
  */
  thumbImage(file: any) {
    switch (file.type) {
      case 'application/pdf':
        return '../../../../../../assets/images/pdf.png';
        break;

      case 'image/png':
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case 'image/jpeg':
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case 'image/jpg':
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case 'image/gif':
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '../../../../../../assets/images/doc.png';
        break;

      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return '../../../../../../assets/images/xls.png';
        break;

      case 'application/vnd.oasis.opendocument.text':
        return '../../../../../../assets/images/odt.png';
        break;

      case 'application/zip':
        return '../../../../../../assets/images/zip.png';
        break;

      case 'image/svg+xml':
        return '../../../../../../assets/images/svg.png';
        break;

      case 'application/vnd.ms-powerpoint':
        return '../../../../../../assets/images/ppt.png';
        break;

      default:
        return '../../../../../../assets/images/no-preview.png';
        break;
    }
  }

  /*
    This Method is used to display the Network Image.
    Find extension from url and display it from Wasabi. So this thumb is prepared from network only.
  */
  thumbNetworkImage(index: any) {
    var extension = this.last_files_array[index].substring(this.last_files_array[index].lastIndexOf('.') + 1);
    if (extension == "doc" || extension == "docx") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/doc.png';
    } else if (extension == "pdf") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf.png';
    } else if (extension == "xls" || extension == "xlsx" || extension == "csv") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/xls.png';
    } else if (extension == "zip") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/zip.png';
    } else if (extension == "ppt") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt.png';
    } else if (extension == "rtf") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf.png';
    } else if (extension == "odt") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/odt.png';
    } else if (extension == "txt") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/txt.png';
    } else if (extension == "jpg" || extension == "png" || extension == "jpeg" || extension == "gif" || extension == "webp") {
      return this.last_files_array[index];
    } else {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/no-preview.png';
    }
  }

  /*
    This method is used for download provision on click of the thumb initially implemented
    now improved as an open the Full size preview.
  */
  imageNetworkPreview(allAttachment: any, index: any) {
    for (let i = 0; i < allAttachment.length; i++) {
      var extension = allAttachment[i].substring(allAttachment[i].lastIndexOf('.') + 1);
      if (extension == "jpg" || extension == "png" || extension == "jpeg" || extension == "gif" || extension == 'webp') {
        var srctmp: any = {
          small: allAttachment[i],
          medium: allAttachment[i],
          big: allAttachment[i]
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "doc" || extension == "docx") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "pdf") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "odt") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "rtf") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "txt") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "ppt") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "xls" || extension == "xlsx" || extension == "csv") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png'
        };
        this.galleryImages.push(srctmp);
      } else {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png'
        };
        this.galleryImages.push(srctmp);
      }
    }
    setTimeout(() => {
      this.gallery.openPreview(index);
    }, 0
    );
  }

  uploadDocuments() {
    let that = this;
    if (that.files.length == 0) {
      that.sb.openSnackBar(that.Invoice_Add_Atleast_One_Document, "error");
    } else {
      const formData = new FormData();
      for (var i = 0; i < that.files.length; i++) {
        formData.append("file[]", that.files[i]);
      }
      formData.append("dir_name", 'invoice');
      formData.append("local_date", moment().format("DD/MM/YYYY hh:mmA"));
      that.uiSpinner.spin$.next(true);
      that.httpCall
        .httpPostCall(httproutes.PORTAL_ATTECHMENT, formData)
        .subscribe(function (params) {
          if (params.status) {
            that.httpCall
              .httpPostCall(httproutes.INVOICE_SAVE_INVOICE_PROCESS, { pdf_urls: params.data })
              .subscribe(function (new_params) {
                if (new_params.status) {
                  that.sb.openSnackBar(new_params.message, "success");
                  that.uiSpinner.spin$.next(false);
                  that.dialogRef.close();
                } else {
                  that.sb.openSnackBar(new_params.message, "error");
                  that.uiSpinner.spin$.next(false);
                }
              });
          } else {
            that.sb.openSnackBar(params.message, "error");
            that.uiSpinner.spin$.next(false);
          }
        });
    }
  }
}


@Component({
  selector: 'orphan-files',
  templateUrl: './orphan-files.html',
  styleUrls: ['./invoice-other-document.component.scss']
})
export class OrphanFiles implements OnInit {
  exitIcon: string;
  mode: any;
  subscription: Subscription;
  userList!: any[];
  orphanlist!: any[];
  showLoader: boolean = true;
  gifLoader: string = '';
  selectedUserList: any = [];
  newUserList: any = [];
  Import_Management_User_Missing_Role: string = '';
  UserLimitExceed: string = '';
  _id!: string;
  viewIcon: any;

  constructor(
    private modeService: ModeDetectService,
    private router: Router,
    public dialogRef: MatDialogRef<OrphanFiles>,
    public mostusedservice: Mostusedservice,
    public httpCall: HttpCall,
    public route: ActivatedRoute,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackbarservice: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    public translate: TranslateService,
  ) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.exitIcon = icon.CANCLE;
      this.viewIcon = icon.VIEW;
    } else {
      this.exitIcon = icon.CANCLE_WHITE;
      this.viewIcon = icon.VIEW_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.exitIcon = icon.CANCLE;
        this.viewIcon = icon.VIEW;
      } else {
        this.mode = "on";
        this.exitIcon = icon.CANCLE_WHITE;
        this.viewIcon = icon.VIEW_WHITE;
      }
    });
    this._id = this.route.snapshot.queryParamMap.get("_id");
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    tmp_locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(tmp_locallanguage);
    this.translate.stream(['']).subscribe((textarray) => {
      this.Import_Management_User_Missing_Role = this.translate.instant('Import_Management_User_Missing_Role');
      this.UserLimitExceed = this.translate.instant('UserLimitExceed');
    });

    // this.userList = data?.reqData;
    // this.gifLoader = this.httpCall.getLoader();
  }

  ngOnInit(): void {

    // this.getAllUserList();
    this.getOrphanDocument();

  }
  // async getAllUserList() {
  //   let data = await this.httpCall.httpGetCall(httproutes.PORTAL_GET_MANAGEMENT_USERS).toPromise();
  //   if (data.status) {
  //     data.data.forEach((element: any) => {
  //       this.newUserList.push({ check: false, _id: element._id, role_id: '', role_name: '' });
  //     });
  //     this.userList = data.data;
  //     this.showLoader = false;
  //   }
  // }
  // getOrphanDocument() {
  //   let that = this;
  //   this.httpCall.httpPostCall(httproutes.INVOICE_SAVE_INVOICE_PROCESS, { pdf_urls: params.data }).subscribe(function (params)
  //     if (params.status) {
  //       that.orphanlist = params.data;
  //       console.log("orphanlist", params.data);
  //     }
  //   });
  // }

  // goToDocument(){

  // }
  goToDocument(document) {

    console.log("invoice11", document.document_type);

    if (document.document_type == 'PACKING_SLIP') {
      this.router.navigate(['/packing-slip-form'], { queryParams: {} });
    }
    // else if (document.document_type == 'Vendor') {
    //   this.router.navigate(['/po-detail-form'], { queryParams: {} });
    // } else if (document.document_type == 'User') {
    //   this.router.navigate(['/quote-detail-form'], { queryParams: {} });
    // }

  }

  getOrphanDocument() {
    console.log("call");
    let that = this;
    this.httpCall.httpPostCall(httproutes.PORTAL_INVOICE_GET_ORPHAN_DOCUMENTS, { _id: this._id }).subscribe(params => {
      if (params.data) {
        that.orphanlist = params.data;
        console.log("orphanlist", params);
      }

    });
  }
  // checkboxChange(i: any, user: any) {
  //   this.newUserList[i].check = !this.newUserList[i].check;
  // }

  // selectRole(event: any, i: any) {
  //   let one_role = _.find(this.allRoles, function (n: any) { return n.role_id == event.value; });
  //   this.newUserList[i].role_id = one_role.role_id;
  //   this.newUserList[i].role_name = one_role.role_name;
  // }

  // importFromManagement() {
  //   let that = this;
  //   let final_users = _.filter(that.newUserList, function (p) {
  //     return p.check == true;
  //   });
  //   let checkInvalid = _.find(final_users, function (n: any) { return n.role_id == ""; });
  //   if (checkInvalid) {
  //     that.snackbarservice.openSnackBar(that.Import_Management_User_Missing_Role, "error");
  //   } else {
  //     that.uiSpinner.spin$.next(true);
  //     let requestObject = {
  //       users: final_users
  //     };
  //     that.httpCall.httpPostCall(httproutes.PORTAL_IMPORT_MANAGEMENT_USERS, requestObject).subscribe(function (params: any) {
  //       if (params.status) {
  //         that.dialogRef.close();
  //         that.uiSpinner.spin$.next(false);
  //         that.snackbarservice.openSnackBar(params.message, "success");
  //       } else {
  //         that.uiSpinner.spin$.next(false);
  //         that.snackbarservice.openSnackBar(params.message, "error");
  //       }
  //     });

  //   }
  // }
}