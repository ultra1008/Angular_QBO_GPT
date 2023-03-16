import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { UiSpinnerService } from 'src/app/service/spinner.service';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: "btn btn-success margin-right-cust s2-confirm",
    denyButton: "btn btn-danger s2-confirm",
  },
  buttonsStyling: false,
  allowOutsideClick: false,
});

class DataTablesResponse {
  data: any[];
  draw: number;
  recordsFiltered: number;
  recordsTotal: number;
}

@Component({
  selector: 'app-view-documents',
  templateUrl: './view-documents.component.html',
  styleUrls: ['./view-documents.component.scss']
})
export class ViewDocumentsComponent implements OnInit {
  locallanguage: string;
  dtOptions: any = {};
  showTable: boolean = true;
  backIcon: string;
  viewIcon: string;
  editIcon: string;
  deleteIcon: string;
  mode: any;
  documentTypes: any = {
    po: 'PURCHASE_ORDER',
    packingSlip: 'PACKING_SLIP',
    receivingSlip: 'RECEIVING_SLIP',
    quote: 'QUOTE',
  };


  constructor (public dialog: MatDialog, private http: HttpClient, private location: Location, public httpCall: HttpCall, private modeService: ModeDetectService,
    public snackbarservice: Snackbarservice, private router: Router) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    let that = this;
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.backIcon = icon.BACK;
      this.viewIcon = icon.VIEW;
      this.editIcon = icon.EDIT;
      this.deleteIcon = icon.DELETE;
    } else {
      this.backIcon = icon.BACK_WHITE;
      this.viewIcon = icon.VIEW_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;
    }
    let j = 0;
    this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.backIcon = icon.BACK;
        this.viewIcon = icon.VIEW;
        this.editIcon = icon.EDIT;
        this.deleteIcon = icon.DELETE;
      } else {
        this.mode = "on";
        this.backIcon = icon.BACK_WHITE;
        this.viewIcon = icon.VIEW_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.deleteIcon = icon.DELETE_WHITE;
      }

      if (j != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 100);
      }
      j++;
    });
  }

  ngOnInit(): void {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage =
      tmp_locallanguage == "" ||
        tmp_locallanguage == undefined ||
        tmp_locallanguage == null
        ? configdata.fst_load_lang
        : tmp_locallanguage;
    let that = this;
    const token = localStorage.getItem(localstorageconstants.INVOICE_TOKEN);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    let headers = new HttpHeaders({ Authorization: token, language: portal_language });
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
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.PORTAL_VIEW_DOCUMENTS_DATATABLE,
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
        $(".button_viewDocViewClass").on("click", (event) => {
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.router.navigate(['/app-custompdfviewer'], { queryParams: { po_url: data.pdf_url } });
        });
        $(".button_viewDocDeleteClass").on("click", (event) => {
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          that.deleteDocument(data._id);
        });
        $(".button_viewDocEditClass").on("click", (event) => {
          let data = JSON.parse(event.target.getAttribute("edit_tmp_id"));
          if (data.document_type == '') {
            that.selectDocumentType(data._id);
          } else
            that.goToEdit(data);
        });
      },
    };
    this.rerenderfunc();
  }

  selectDocumentType(_id): void {
    let that = this;
    console.log("12312", _id);

    const dialogRef = this.dialog.open(DocumentSelectDialog, {
      data: {
        _id: _id
      },
      disableClose: true,


    });

    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  getColumName() {
    let that = this;
    return [
      {
        title: 'Document Type',
        render: function (data: any, type: any, full: any) {
          if (full.document_type == '') {
            return 'No Identifying Information';
          }
          return full.document_type;
        },
        defaultContent: "",
      },
      {
        title: 'PO NO',
        data: "po_no",
        defaultContent: "",
      },
      {
        title: 'Invoice No',
        data: "invoice_no",
        defaultContent: "",
      },
      {
        title: 'Vendor Name',
        data: "vendor_name",
        defaultContent: "",
      },
      {
        title: 'Action',
        render: function (data: any, type: any, full: any) {

          let tmp_tmp = {
            _id: full._id,
            document_type: full.document_type,
            pdf_url: full.pdf_url,

          };
          let view = `<a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_viewDocViewClass" >` + '<img src="' + that.viewIcon + `" alt="" height="15px">View</a>`;
          let edit = '';
          let archive = `<a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_viewDocDeleteClass" >` + '<img src="' + that.deleteIcon + `" alt="" height="15px">Delete</a>`;
          if (full.document_type != 'Already Exists') {
            edit = `<a edit_tmp_id='` + JSON.stringify(full) + `' class="dropdown-item button_viewDocEditClass" >` + '<img src="' + that.editIcon + `" alt="" height="15px">Edit</a>`;
          }
          return (
            `
         <div class="dropdown">
           <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  aria-haspopup="true" aria-expanded="false"  edit_tmp_id='` + JSON.stringify(full) + `' aria-hidden="true"></i>
           <div class= "dropdown-content-cust" aria-labelledby="dropdownMenuButton">
             ` + view + `
             ` + edit + `
             ` + archive + `
           </div>
       </div>`
          );
        },
        width: "1%",
        orderable: false,
      },
    ];
  }

  goToEdit(document) {
    let that = this;
    if (document.document_type == that.documentTypes.po) {
      that.router.navigate(['/po-detail-form'], { queryParams: { document_id: document._id } });
    } else if (document.document_type == that.documentTypes.packingSlip) {
      that.router.navigate(['/packing-slip-form'], { queryParams: { document_id: document._id } });
    } else if (document.document_type == that.documentTypes.receivingSlip) {
      that.router.navigate(['/receiving-slip-form'], { queryParams: { document_id: document._id } });
    } else if (document.document_type == that.documentTypes.quote) {
      that.router.navigate(['/quote-detail-form'], { queryParams: { document_id: document._id } });
    }
  }

  deleteDocument(_id) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: 'Are you sure you want to delete this document?',
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.httpCall
            .httpPostCall(httproutes.PORTAL_DELETE_DOCUMENTS, { _id: _id })
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

  back() {
    this.location.back();
  }
}




@Component({
  selector: 'document-select-dialog',
  templateUrl: './document-select-dialog.html',
  styleUrls: ['./view-documents.component.scss']
})
export class DocumentSelectDialog {

  user_data: any = {};
  selectdocumenttype: FormGroup;
  @Input() documentType: any;
  DOCUMENT_TYPE: any = configdata.DOCUMENT_TYPE;
  http: any;
  LOCAL_OFFSET: number;
  exitIcon: string;
  yesButton: string = "";
  noButton: string = "";
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = "";
  add_my_self: string;
  saveIcon = icon.SAVE_WHITE;
  projectId: any = [];
  documentTypes: any = {
    po: 'PURCHASE_ORDER',
    packingSlip: 'PACKING_SLIP',
    receivingSlip: 'RECEIVING_SLIP',
    quote: 'QUOTE',
    invoice: 'INVOICE'
  };


  constructor (
    private modeService: ModeDetectService,
    public dialogRef: MatDialogRef<DocumentSelectDialog>,
    public translate: TranslateService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public spinner: UiSpinnerService,
    public sb: Snackbarservice,
    public route: ActivatedRoute,
    public httpCall: HttpCall,
    public snackbarservice: Snackbarservice

  ) {
    console.log("data", data);
    this.projectId = data.project_id;
    this.LOCAL_OFFSET = moment().utcOffset() * 60;
    let tmp_user = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    this.user_data = tmp_user.UserData;
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.exitIcon = icon.CANCLE;
      this.add_my_self = icon.ADD_MY_SELF;
    } else {
      this.exitIcon = icon.CANCLE_WHITE;
      this.add_my_self = icon.ADD_MY_SELF_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.exitIcon = icon.CANCLE;
        this.add_my_self = icon.ADD_MY_SELF;
      } else {
        this.mode = "on";
        this.exitIcon = icon.CANCLE_WHITE;
        this.add_my_self = icon.ADD_MY_SELF_WHITE;
      }
    });

    this.translate.stream([""]).subscribe((textarray) => {
      this.copyDataFromProject = this.translate.instant("Copy_Data_From_Project");
      this.yesButton = this.translate.instant("Compnay_Equipment_Delete_Yes");
      this.noButton = this.translate.instant("Compnay_Equipment_Delete_No");
    });
  }

  ngOnInit(): void {
    let that = this;
    that.selectdocumenttype = that.formBuilder.group({
      select_form: [""],
    });

  };

  onDocumentSelectFormSelect(event) {
    this.dialogRef.close();

    let that = this;
    console.log("document_type", event);
    if (event == that.documentTypes.po) {
      that.router.navigate(['/po-detail-form'], { queryParams: { document_id: this.data._id } });
    } else if (event == that.documentTypes.packingSlip) {
      that.router.navigate(['/packing-slip-form'], { queryParams: { document_id: this.data._id } });
    } else if (event == that.documentTypes.receivingSlip) {
      that.router.navigate(['/receiving-slip-form'], { queryParams: { document_id: this.data._id } });
    } else if (event == that.documentTypes.quote) {
      that.router.navigate(['/quote-detail-form'], { queryParams: { document_id: this.data._id } });
    } else if (event == that.documentTypes.invoice) {
      that.router.navigate(['/invoice-form'], { queryParams: { document_id: this.data._id } });
    }
  }


}