import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxGalleryComponent, NgxGalleryOptions, NgxGalleryImage } from 'ngx-gallery-9';
import { Subject, Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { commonFileChangeEvent, formatPhoneNumber, gallery_options, LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { ModeDetectService } from '../map/mode-detect.service';
import moment from "moment";
import { event } from 'jquery';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  allowOutsideClick: false

});

class DataTablesResponse {
  data: any;
  draw: any;
  recordsFiltered: any;
  recordsTotal: any;
}

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {
  isManagement: boolean = true;
  mode: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  btn_grid_list_text: any;
  listtogrid_text: any;
  gridtolist_text: any;
  username_search: any;

  gridtolist: Boolean = true;
  addTeamMember: boolean = true;
  locallanguage: any;
  invoice_search: any;
  User_Card_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  acticve_word: string = "";
  inacticve_word: string = "";
  subscription!: Subscription;
  historyIcon!: string;
  trashIcon!: string;
  importIcon!: string;
  editIcon!: string;
  gridIcon: string;
  listIcon: string;
  denyIcon: string;
  approveIcon: string;
  sorting_asc: Boolean = false;
  sorting_desc: Boolean = false;
  soruing_all: Boolean = true;
  allInvoices: any = [];
  vendorsList = [];
  viewIcon: string = '';
  invoiceCount: any = {
    pending: 0,
    complete: 0
  };
  add_my_self_ico = icon.ADD_MY_SELF_WHITE;
  reportIcon: string = "";
  role_to: any;
  role_permission: any;
  invoice_status: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild('OpenFilebox') OpenFilebox: any;
  Company_Equipment_File_Not_Match: any;
  showInvoiceTable = true;
  dtOptions: DataTables.Settings = {};

  constructor(private router: Router, private modeService: ModeDetectService, public mostusedservice: Mostusedservice,
    public translate: TranslateService, public dialog: MatDialog,
    public httpCall: HttpCall, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService) {
    let tmp_gridtolist_team = localStorage.getItem("gridtolist_invoice_list");
    this.gridtolist =
      tmp_gridtolist_team == "grid" || tmp_gridtolist_team == null
        ? true
        : false;
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.trashIcon = icon.DELETE;
      this.editIcon = icon.EDIT;
      this.reportIcon = icon.REPORT;
      this.viewIcon = icon.VIEW;
      this.gridIcon = icon.GRID;
      this.listIcon = icon.List;
      this.denyIcon = icon.DENY;
      this.approveIcon = icon.APPROVE;

    } else {
      this.trashIcon = icon.DELETE_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.reportIcon = icon.REPORT_WHITE;
      this.viewIcon = icon.VIEW_WHITE;
      this.gridIcon = icon.GRID_WHITE;
      this.listIcon = icon.List_LIGHT;
      this.denyIcon = icon.DENY_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;

    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.trashIcon = icon.DELETE;
        this.editIcon = icon.EDIT;
        this.reportIcon = icon.REPORT;
        this.viewIcon = icon.VIEW;
        this.gridIcon = icon.GRID;
        this.listIcon = icon.List;
        this.denyIcon = icon.DENY;
        this.approveIcon = icon.APPROVE;

      } else {
        this.mode = 'on';
        this.trashIcon = icon.DELETE_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.reportIcon = icon.REPORT_WHITE;
        this.viewIcon = icon.VIEW_WHITE;
        this.gridIcon = icon.GRID_WHITE;
        this.listIcon = icon.List_LIGHT;
        this.denyIcon = icon.DENY_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;

      }
      this.rerenderfunc();
    });

    this.translate.stream(['']).subscribe((textarray) => {
      this.User_Card_Do_Want_Delete = this.translate.instant('User_Card_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
      this.Company_Equipment_File_Not_Match = this.translate.instant('Company_Equipment_File_Not_Match');
    });
  }

  ngOnInit(): void {
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '');
    this.role_to = role_permission.UserData.role_name;
    // let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    // if (role_permission.role_permission.team.team.Add == false) {
    //   this.addTeamMember = false;
    // }
    // if (role_permission.role_permission.team.team.Delete == false) {
    //   this.deleteTeamMember = false;
    // }
    let that = this;
    this.getAllVendors();
    this.uiSpinner.spin$.next(true);
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    that.translate.use(this.locallanguage);
    let i = 0;
    this.translate.stream(['']).subscribe((textarray) => {
      that.acticve_word = this.translate.instant('Team-EmployeeList-Status-Active');
      that.inacticve_word = this.translate.instant('project_setting_inactive');

      that.translate.get('Employee-List-list-to-grid').subscribe((text: string) => {
        that.listtogrid_text = text;
      });

      that.translate.get('Employee-List-grid-to-list').subscribe((text: string) => {
        that.gridtolist_text = text; that.btn_grid_list_text = text;
      });

      if (this.locallanguage === 'en') {
        this.locallanguage = 'es';
      } else {
        this.locallanguage = 'en';
      }
      if (i != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 100);
      }
      i++;
    });
    that.dtOptions = {
      pagingType: 'full_numbers',
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
      // rowCallback: (row: Node, invoice: any[] | Object, index: number) => {
      //   const self = this;
      //   $('td', row).off('click');
      //   $('td', row).on('click', () => {
      //    self.editInvoice(invoice);
      //     console.log("invoice", invoice);

      //   });
      //   return row;
      // }
    };

    this.getAllInvoices();
  }

  // someClickHandler(info: any): void {
  //   this.message = info.id + ' - ' + info.firstName;
  // }
  rerenderfunc() {
    this.showInvoiceTable = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    this.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    setTimeout(() => {
      that.showInvoiceTable = true;
    }, 100);
  }
  sorting_name() {
    if (this.sorting_desc) {
      this.sorting_desc = false;
      this.sorting_asc = true;
      this.soruing_all = false;
      this.allInvoices = this.allInvoices.sort((a: any, b: any) => a.invoice_no.localeCompare(b.invoice_no, 'en', { sensitivity: 'base' }));
    } else if (this.sorting_asc) {
      this.sorting_desc = true;
      this.sorting_asc = false;
      this.soruing_all = false;
      this.allInvoices = this.allInvoices.reverse((a: any, b: any) => a.invoice_no.localeCompare(b.invoice_no, 'en', { sensitivity: 'base' }));

    } else {
      this.sorting_desc = false;
      this.sorting_asc = true;
      this.soruing_all = false;
      this.allInvoices = this.allInvoices.sort((a: any, b: any) => a.invoice_no.localeCompare(b.invoice_no, 'en', { sensitivity: 'base' }));
    }
  }

  searchData(searchValue: any) {
    this.allInvoices = this.allInvoices.filter((item: any) => {
      return item.invoice_no.toLowerCase().includes(searchValue.toLowerCase());
    });
  }

  gotoArchive() {
    this.router.navigateByUrl('/archive-team-list');
  }

  phonenoFormat(data: any) {
    return formatPhoneNumber(data);
  }
  updateInvoice(requestObject) {
    let that = this;
    console.log("requestObject", requestObject);
    // this.id = requestObject.invoice._id;

    // console.log("_id", this.id);
    that.uiSpinner.spin$.next(true);
    that.httpCall.httpPostCall(httproutes.INVOICE_UPDATE_INVOICE_STATUS, requestObject).subscribe(params => {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.uiSpinner.spin$.next(false);
        that.getAllInvoices();
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);

      }
    });
  }


  gridTolist() {
    if (this.gridtolist) {
      this.rerenderfunc();
      this.btn_grid_list_text = this.listtogrid_text;
      localStorage.setItem('gridtolist_invoice_list', "list");
      this.gridtolist = false;
    } else {
      this.btn_grid_list_text = this.gridtolist_text;
      localStorage.setItem('gridtolist_invoice_list', "grid");
      this.gridtolist = true;
    }
  }

  invoiceUpdateCard() {
    this.getAllInvoices();
  }

  getAllInvoices() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.INVOICE_GET_LIST).subscribe(function (params) {
      if (params.status) {
        that.allInvoices = params.data;
        that.invoiceCount = params.count;
        that.isManagement = params.is_management;
        console.log("invoiceList", that.allInvoices);
      }
      that.uiSpinner.spin$.next(false);
    });
  }

  getAllVendors() {
    let that = this;
    that.httpCall
      .httpGetCall(httproutes.INVOICE_VENDOR_GET)
      .subscribe(function (params) {
        if (params.status) {
          that.vendorsList = params.data;
          console.log("vendorsList", params.data);

        }
      });
  }


  invoiceReportDialog() {
    const dialogRef = this.dialog.open(InvoiceReport, {
      height: '500px',
      width: '800px',
      data: this.vendorsList
      ,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  importProcessData() {
    let that = this;
    that.uiSpinner.spin$.next(true);
    this.httpCall.httpGetCall(httproutes.INVOICE_PROCESS_INVOICE_DATA).subscribe(function (params) {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.uiSpinner.spin$.next(false);
        that.getAllInvoices();
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);
      }
    });
  }

  viewInvoice(invoice) {
    this.router.navigate(['/invoice-detail'], { queryParams: { _id: invoice._id } });
  }

  editInvoice(invoice) {
    console.log("invoice123", invoice);

    this.router.navigate(['/invoice-form'], { queryParams: { _id: invoice._id } });
  }


  openAddDialog() {
    let that = this;
    const dialogRef = this.dialog.open(InvoiceAttachment, {
      height: '400px',
      width: '700px',
      data: {},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      that.getAllInvoices();
    });
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  importManagementInvoice() {
    let that = this;
    that.uiSpinner.spin$.next(true);
    this.httpCall.httpGetCall(httproutes.INVOICE_IMPORT_MANAGEMENT_INVOICE).subscribe(function (params) {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.uiSpinner.spin$.next(false);
        that.getAllInvoices();
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);
      }
    });
  }

  importManagementPO() {
    let that = this;
    that.uiSpinner.spin$.next(true);
    this.httpCall.httpGetCall(httproutes.INVOICE_IMPORT_MANAGEMENT_PO).subscribe(function (params) {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.uiSpinner.spin$.next(false);
        that.getAllInvoices();
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
        that.uiSpinner.spin$.next(false);
      }
    });
  }
}


@Component({
  selector: 'invoice-attachment-form',
  templateUrl: './invoice-attachment-form.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceAttachment {
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
    public dialogRef: MatDialogRef<InvoiceAttachment>,
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
  selector: 'invoice-report',
  templateUrl: './invoice-report.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceReport {
  is_oneOnly: boolean = true;
  public form: any;
  public vendorList = [];
  selectedRoles: any;
  public statusList = configdata.INVOICES_STATUS;
  selectedStatus: any;

  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  saveIcon: string;
  emailsList: any[] = [];
  range = new FormGroup({
    start_date: new FormControl(),
    end_date: new FormControl()
  });
  invoiceinfo: FormGroup;
  Report_File_Message: string = "";
  Report_File_Enter_Email: string = "";
  exitIcon: string;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;

  constructor(private modeService: ModeDetectService, private formBuilder: FormBuilder, public httpCall: HttpCall,
    public dialogRef: MatDialogRef<InvoiceReport>,
    @Inject(MAT_DIALOG_DATA) public data: any, public sb: Snackbarservice, public translate: TranslateService) {

    console.log("dataaaaaa", data);
    this.Report_File_Message = this.translate.instant('Report_File_Message');
    this.Report_File_Enter_Email = this.translate.instant('Report_File_Enter_Email');
    this.vendorList = data;
    this.invoiceinfo = this.formBuilder.group({
      All_Vendors: [true],
      vendor_ids: [this.vendorList.map((el: any) => el._id)],
      All_Status: [true],
      status: [this.statusList.map((el: any) => el.name)],
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.exitIcon = icon.CANCLE;
      this.saveIcon = icon.SAVE_WHITE;

    } else {
      this.exitIcon = icon.CANCLE_WHITE;
      this.saveIcon = icon.SAVE_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.exitIcon = icon.CANCLE;
        this.saveIcon = icon.SAVE_WHITE;

      } else {
        this.mode = 'on';
        this.exitIcon = icon.CANCLE_WHITE;
        this.saveIcon = icon.SAVE_WHITE;

      }
      console.log("DARK MODE: " + this.mode);

    });

  }

  isValidMailFormat(value: any) {
    var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (value != "" && (EMAIL_REGEXP.test(value))) {
      return { "Please provide a valid email": true };
    }
    return null;
  }

  addInternalEmail(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
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

  internalEmailremove(email: any): void {
    //----
    let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
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

  ngOnInit(): void {
    let that = this;
    this.invoiceinfo.get("vendor_ids")!.valueChanges.subscribe(function (params: any) {
      if (params.length == that.vendorList.length) {
        that.invoiceinfo.get("All_Vendors")!.setValue(true);
      } else {
        that.invoiceinfo.get("All_Vendors")!.setValue(false);
      }
    });
    this.invoiceinfo.get("status")!.valueChanges.subscribe(function (params: any) {
      if (params.length == that.statusList.length) {
        that.invoiceinfo.get("All_Status")!.setValue(true);
      } else {
        that.invoiceinfo.get("All_Status")!.setValue(false);
      }
    });
  }

  onChangeValueAll_Vendors(params: any) {
    if (params.checked) {
      this.invoiceinfo.get("vendor_ids")!.setValue(this.vendorList.map((el: any) => el._id));
    } else {
      this.invoiceinfo.get("vendor_ids")!.setValue([]);
    }
  }

  onChangeValueAll_Status(params: any) {
    if (params.checked) {
      this.invoiceinfo.get("status")!.setValue(this.statusList.map(el => el.name));
    } else {
      this.invoiceinfo.get("status")!.setValue([]);
    }
  }

  saveData() {
    if (this.emailsList.length != 0) {
      this.sb.openSnackBar(this.Report_File_Message, "success");
      let requestObject = this.invoiceinfo.value;
      var company_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
      requestObject.email_list = this.emailsList;
      requestObject.logo_url = company_data.companydata.companylogo;

      this.httpCall.httpPostCall(httproutes.PORTAL_INVOICE_REPORT, requestObject).subscribe(function (params: any) { });
      setTimeout(() => {
        this.dialogRef.close();
      }, 3000);
    } else {
      this.sb.openSnackBar(this.Report_File_Enter_Email, "error");
    }
  }
  addmyself() {
    if (this.is_oneOnly) {
      let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
      this.emailsList.push(user_data.UserData.useremail);
      this.is_oneOnly = false;
    }
  }
}