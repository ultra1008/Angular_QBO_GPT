import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DataTableDirective } from 'angular-datatables';
import { NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { Subscription } from 'rxjs';
import { localstorageconstants, icon, httproutes } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { gallery_options, LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import { ModeDetectService } from '../map/mode-detect.service';

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  // dtOptions: any = {}; @ViewChild(DataTableDirective, { static: false })
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
  gridtolist: Boolean = true;
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
  approveIcon: string = "";
  rejectIcon: string = "";
  backIcon: string;
  viewIcon: string;
  Purchasing_Orders_View: any;
  listIcon!: string;
  gridIcon: string;
  reportinfo: FormGroup;
  btn_grid_list_text: any;
  listtogrid_text: any;
  gridtolist_text: any;
  count: number = 0;
  allInvoices: any = [];
  range = new FormGroup({
    start_date: new FormControl(),
    end_date: new FormControl()
  });
  constructor(private modeService: ModeDetectService,
    private router: Router,
    private http: HttpClient,
    public httpCall: HttpCall,
    public uiSpinner: UiSpinnerService,
    public snackbarservice: Snackbarservice,
    public mostusedservice: Mostusedservice,
    public route: ActivatedRoute,
    public translate: TranslateService) {


    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";

    if (this.mode == "off") {
      this.reportIcon = icon.REPORT;
      this.approveIcon = icon.APPROVE;
      this.rejectIcon = icon.DENY;
      this.backIcon = icon.BACK;
      this.editIcon = icon.EDIT;
      this.viewIcon = icon.VIEW;
      this.gridIcon = icon.GRID;
      this.listIcon = icon.List;
    } else {
      this.reportIcon = icon.REPORT_WHITE;
      this.approveIcon = icon.APPROVE_WHITE;
      this.rejectIcon = icon.DENY_WHITE;
      this.backIcon = icon.BACK_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.viewIcon = icon.VIEW_WHITE;
      this.gridIcon = icon.GRID_WHITE;
      this.listIcon = icon.List_LIGHT;
    }
    let j = 0;
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.reportIcon = icon.REPORT;
        this.approveIcon = icon.APPROVE;
        this.rejectIcon = icon.DENY;
        this.backIcon = icon.BACK;
        this.editIcon = icon.EDIT;
        this.viewIcon = icon.VIEW;
        this.gridIcon = icon.GRID;
        this.listIcon = icon.List;

      } else {
        this.mode = "on";
        this.reportIcon = icon.REPORT_WHITE;
        this.approveIcon = icon.APPROVE_WHITE;
        this.rejectIcon = icon.DENY_WHITE;
        this.backIcon = icon.BACK_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.viewIcon = icon.VIEW_WHITE;
        this.gridIcon = icon.GRID_WHITE;
        this.listIcon = icon.List_LIGHT;
      }
      if (j != 0) {
        setTimeout(() => {
          this.rerenderfunc();
        }, 100);
      }
      j++;
    });
    let i = 0;
    let that = this;
    // this.uiSpinner.spin$.next(true);
    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant("Copy_Data_From_Project");
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
      that.Listing_Action_Edit = that.translate.instant('Listing_Action_Edit');
      that.inacticve_word = this.translate.instant("project_setting_inactive");
      that.invoice_no = that.translate.instant("invoice_no");
      that.po_no = that.translate.instant("po_no");
      that.packing_slip_no = that.translate.instant("packing_slip_no");
      that.Receiving_Slip = that.translate.instant("Receiving_Slip");
      that.Vendor_Action = that.translate.instant("Vendor_Action");
      that.Receiving_Attachment = that.translate.instant("Receiving_Attachment");
      that.Vendor_Status = that.translate.instant("Vendor_Status");
      that.template_notes = that.translate.instant("template_notes");
      if (i != 0) {
        setTimeout(() => {
          this.rerenderfunc();
        }, 100);
      }
      i++;
    });
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

        this.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.INVOICE_GET_INVOICE_DATATABLE,
            dataTablesParameters,
            { headers: headers }
          )
          .subscribe((resp) => {
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data,
            });
            this.count = resp.recordsTotal;
          });
      },
      columns: this.getColumnName(),
      // Declare the use of the extension in the dom parameter
      dom: 'Bfrtip',
      columnDefs: [
        {
          targets: [0, 1],
          className: 'noVis'
        }
      ],

      // Configure the buttons
      buttons: [
        // 'columnsToggle',
        // 'colvis',
        {
          extend: 'colvis',
          columns: ':not(.noVis)'

        },
        // 'copy',
        // 'print',
        // 'excel',
        {
          extend: 'excelHtml5',
          title: 'Invoice excel Report',
          //  messageTop: '"https://s3.us-west-1.wasabisys.com/rovukdata/few-clouds.png"',
          titleAttr: 'Export Excel',
          exportOptions: {
            columns: ':visible'
          }
        },
        // {
        //   text: 'Some button',
        //   key: '1',
        //   action: function (e: any, dt: any, node: any, config: any) {
        //     alert('Button activated');
        //   }
        // }
      ],

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
          let invoice1 = event.target.getAttribute("edit_tmp_id")?.replace(/\\/g, "'");
          let invoice = JSON.parse(invoice1 ?? '');
          this.router.navigate(['/invoice-form'], { queryParams: { _id: invoice._id } });
        });
        $(".button_poReceivedViewClass").on("click", (event) => {
          // PO PDF view here
          let invoice = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          this.router.navigate(['/invoice-detail'], { queryParams: { _id: invoice._id } });
          /* this.router.navigate(["/app-custompdfviewer"], {
            queryParams: {
              po_url: data.received_url,
              po_status: data.po_status,
              po_id: data._id,
            },
          }); */
        });
        $(".button_shiftApproveClass").on("click", (event) => {
          // Approve Invoice here
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          // this.updateInvoice({ _id: data._id, status: 'Approved' });
        });
        $(".button_shiftRejectClass").on("click", (event) => {
          // Approve Invoice here
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          // this.updateInvoice({ _id: data._id, status: 'Rejected' });
        });
      },
    };
    // this.rerenderfunc();
    // this.dtOptions = {
    //   // ajax: 'data/data.json',
    //   columns: [
    //     //   {
    //     //   title: 'Invoice',
    //     //   data: 'id'
    //     // }, {
    //     //   title: 'First name',
    //     //   data: 'firstName'
    //     // }, {
    //     //   title: 'Last name',
    //     //   data: 'lastName'
    //     // }
    //     {
    //       title: this.invoice_no,
    //       data: "invoice",
    //       defaultContent: "",
    //     },
    //     {
    //       title: this.po_no,
    //       data: "p_o",
    //       defaultContent: "",
    //     },
    //     {
    //       title: this.packing_slip_no,
    //       data: "packing_slip",
    //       defaultContent: "",
    //     },
    //     {
    //       title: this.Receiving_Slip,
    //       data: "receiving_slip",
    //       defaultContent: "",
    //     },
    //     {
    //       title: this.Vendor_Status,
    //       data: 'status',
    //       defaultContent: "",

    //       width: "7%",
    //     },
    //     {
    //       title: this.Receiving_Attachment,
    //       defaultContent: "",

    //       width: "1%",
    //       orderable: false,
    //     },

    //   ],


    //   // Declare the use of the extension in the dom parameter
    //   dom: 'Bfrtip',
    //   // Configure the buttons
    //   buttons: [
    //     'columnsToggle',
    //     'colvis',
    //     // 'copy',
    //     // 'print',
    //     // 'excel',
    //     // {
    //     //   text: 'Some button',
    //     //   key: '1',
    //     //   action: function (e: any, dt: any, node: any, config: any) {
    //     //     alert('Button activated');
    //     //   }
    //     // }
    //   ]
    // };
  }

  getColumnName() {
    return [
      //   {
      //   title: 'Invoice',
      //   data: 'id'
      // }, {
      //   title: 'First name',
      //   data: 'firstName'
      // }, {
      //   title: 'Last name',
      //   data: 'lastName'
      // }
      {
        title: this.invoice_no,
        data: "invoice",
        defaultContent: "",

      },
      {
        title: this.po_no,
        data: "p_o",
        defaultContent: "",



      },
      {
        title: this.packing_slip_no,
        data: "packing_slip",
        defaultContent: "",
      },
      {
        title: this.Receiving_Slip,
        data: "receiving_slip",
        defaultContent: "",
      },
      {
        title: this.Vendor_Status,
        data: 'status',
        defaultContent: "",

        width: "7%",
      },
      {
        title: this.Receiving_Attachment,
        defaultContent: "",

        width: "1%",
        orderable: false,
      },

    ];
  }
  downloadButtonPress(event, index): void {
    window.location.href = this.imageObject[index];
  }
  rerenderfunc() {
    this.showTable = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    this.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    setTimeout(() => {
      that.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
      that.dtOptions.columns = that.getColumnName();
      that.showTable = true;
    }, 100);
  }

}


