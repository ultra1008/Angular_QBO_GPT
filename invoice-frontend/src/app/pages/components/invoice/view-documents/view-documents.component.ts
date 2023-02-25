import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import { ModeDetectService } from '../../map/mode-detect.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Snackbarservice } from 'src/app/service/snack-bar-service';

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
  deleteIcon: string;
  mode: any;

  constructor (private http: HttpClient, private location: Location, public httpCall: HttpCall, private modeService: ModeDetectService,
    public snackbarservice: Snackbarservice, private router: Router) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    let that = this;
    this.mode = modeLocal === "on" ? "on" : "off";
    if (this.mode == "off") {
      this.backIcon = icon.BACK;
      this.viewIcon = icon.VIEW;
      this.deleteIcon = icon.DELETE;
    } else {
      this.backIcon = icon.BACK_WHITE;
      this.viewIcon = icon.VIEW_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;
    }
    let j = 0;
    this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
        this.backIcon = icon.BACK;
        this.viewIcon = icon.VIEW;
        this.deleteIcon = icon.DELETE;
      } else {
        this.mode = "on";
        this.backIcon = icon.BACK_WHITE;
        this.viewIcon = icon.VIEW_WHITE;
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

      },
    };
    this.rerenderfunc();
  }

  getColumName() {
    let that = this;
    return [
      {
        title: 'Document Type',
        data: "document_type",
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
            pdf_url: full.pdf_url,
          };
          let view = `<a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_viewDocViewClass" >` + '<img src="' + that.viewIcon + `" alt="" height="15px">View</a>`;
          let archive = `<a edit_tmp_id='` + JSON.stringify(tmp_tmp) + `' class="dropdown-item button_viewDocDeleteClass" >` + '<img src="' + that.deleteIcon + `" alt="" height="15px">Delete</a>`;
          return (
            `
         <div class="dropdown">
           <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  aria-haspopup="true" aria-expanded="false"  edit_tmp_id='` + JSON.stringify(full) + `' aria-hidden="true"></i>
           <div class= "dropdown-content-cust" aria-labelledby="dropdownMenuButton">
             ` + view + `
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
