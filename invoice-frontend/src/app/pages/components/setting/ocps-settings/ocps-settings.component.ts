import { Component, OnInit, Inject, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { httproutesv2, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as _ from 'lodash';
import { LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import * as XLSX from 'xlsx';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { AnyLayer } from 'mapbox-gl';
import { Subscription } from 'rxjs';
import { ModeDetectService } from '../../map/mode-detect.service';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false
});

class DataTablesResponse {
  data: any;
  draw: any;
  recordsFiltered: any;
  recordsTotal: any;
}

@Component({
  selector: 'app-ocps-settings',
  templateUrl: './ocps-settings.component.html',
  styleUrls: ['./ocps-settings.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class OcpsSettingsComponent implements OnInit {

  @ViewChild(DataTableDirective, { static: false }) datatableElement: any;
  @ViewChild('OpenFilebox') OpenFilebox: any;
  packaging_data: any = [];
  manufacturer_data: any = [];
  equipment_data: any = [];
  ownership_data: any = [];
  status_data: any = [];
  frequency_data: any = [];
  expenses_type_data: any = [];
  itemType: any = [];
  color_data: any = [];
  terms_data: any = [];
  language_data: any = [];
  weight_data: any = [];
  creditCard: any = [];
  projectdoc_data: any = [];
  GAS_SETTING: string = configdata.GAS_SETTING;
  STATUS_IDLE_SETTING: string = configdata.STATUS_IDLE_SETTING;
  STATUS_In_Use_SETTING: string = configdata.STATUS_In_Use_SETTING;
  Settings_Other_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  CompnayCodes_data: any;
  CompnayCodes_data_tmp: any;
  Company_Equipment_File_Not_Match: any;
  show_hide_table = true;
  category_name: any;
  category_code: any;
  sub_category_code: any;
  sub_category_code_name: any;
  Superadmin_Distributorlist_Action: any;
  CSIDivisionWorkPerformed_Text: any;
  ScheduleOfValueItem_Text: any;
  NON_MINORITY_CODE: string = configdata.NON_MINORITY_CODE;

  dtOptions: DataTables.Settings = {};
  dtOptionsScheduleOfItem: DataTables.Settings = {};
  addIcon: string;
  editIcon: string;
  deleteIcon: string;
  mode: any;
  subscription: Subscription;
  showTable: boolean = true;
  Notesvalue: any;
  Note_data: any;
  Note_data_tmp: any;
  add_my_self_Icon = icon.ADD_MY_SELF_WHITE;
  importIcon: string;


  @ViewChild('OpenFilebox_CompnayCodes') OpenFilebox_CompnayCodes: any;
  @ViewChild('OpenFilebox_CompnayTypes') OpenFilebox_CompnayTypes: any;
  @ViewChild('OpenFilebox_CompnaySizes') OpenFilebox_CompnaySizes: any;
  @ViewChild('OpenFilebox_MinorityCodes') OpenFilebox_MinorityCodes: any;
  @ViewChild('OpenFilebox_ProjectTypes') OpenFilebox_ProjectTypes: any;
  @ViewChild('OpenFilebox_DocumentTypes') OpenFilebox_DocumentTypes: any;
  @ViewChild('OpenFilebox_PrimeWorkPerformed') OpenFilebox_PrimeWorkPerformed: any;
  @ViewChild('OpenFilebox_CSIDivisionWorkPerformed') OpenFilebox_CSIDivisionWorkPerformed: any;
  @ViewChild('OpenFilebox_ScheduleOfValueItem') OpenFilebox_ScheduleOfValueItem: any;
  @ViewChild('OpenFilebox_PerformanceReasons') OpenFilebox_PerformanceReasons: any;
  @ViewChild('OpenFilebox_PaymentFor') OpenFilebox_PaymentFor: any;
  @ViewChild('OpenFilebox_PaymentType') OpenFilebox_PaymentType: any;
  @ViewChild('OpenFilebox_Frequency') OpenFilebox_Frequency: any;
  @ViewChild('OpenFilebox_UnitOfMeasure') OpenFilebox_UnitOfMeasure: any;
  @ViewChild('OpenFilebox_EquipmentType') OpenFilebox_EquipmentType: any;
  @ViewChild('OpenFilebox_Notes') OpenFilebox_Notes: any;
  @ViewChild('OpenFilebox_ContractType') OpenFilebox_ContractType: any;
  @ViewChild('OpenFilebox_Department') OpenFilebox_Department: any;

  Export_file_message: any;
  constructor(public dialog: MatDialog, private modeService: ModeDetectService, public http: HttpClient, public httpCall: HttpCall, public sb: Snackbarservice,
    public translate: TranslateService, private uiSpinner: UiSpinnerService,) {
    let i = 0;
    let that = this;
    this.translate.stream(['']).subscribe((textarray) => {
      this.Settings_Other_Do_Want_Delete = this.translate.instant('Settings_Other_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
      this.category_name = this.translate.instant('category_name');
      this.category_code = this.translate.instant('category_code');
      this.sub_category_code = this.translate.instant('sub_category_code');
      this.sub_category_code_name = this.translate.instant('sub_category_code_name');
      this.Superadmin_Distributorlist_Action = this.translate.instant('Superadmin_Distributorlist_Action');
      this.Export_file_message = this.translate.instant('Export_file_message');
      this.CSIDivisionWorkPerformed_Text = this.translate.instant('CSIDivisionWorkPerformed');
      this.ScheduleOfValueItem_Text = this.translate.instant('ScheduleOfValueItem');

      if (i != 0) {
        setTimeout(() => {
          that.refrshDatabase();
        }, 1000);
      }
      i++;
    });

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.addIcon = icon.ADD_MY_SELF;
      this.editIcon = icon.EDIT;
      this.deleteIcon = icon.DELETE;
      this.importIcon = icon.IMPORT;
      this.refrshDatabase();
    } else {
      this.addIcon = icon.ADD_MY_SELF_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.deleteIcon = icon.DELETE_WHITE;
      this.importIcon = icon.IMPORT_WHITE;
      this.refrshDatabase();
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.addIcon = icon.ADD_MY_SELF;
        this.editIcon = icon.EDIT;
        this.deleteIcon = icon.DELETE;
        this.importIcon = icon.IMPORT;
        this.refrshDatabase();
      } else {
        this.mode = 'on';
        this.addIcon = icon.ADD_MY_SELF_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.deleteIcon = icon.DELETE_WHITE;
        this.importIcon = icon.IMPORT_WHITE;
        this.refrshDatabase();
      }
      // this.getColumName();
      // console.log("DARK MODE: " + this.mode);
    });

  }

  // rerenderfunc() {
  //   var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
  //   let that = this;
  //   this.showTable = false;
  //   setTimeout(() => {
  //     that.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
  //     that.dtOptions.columns = that.getColumName();
  //     that.showTable = true;
  //   }, 200);
  // }

  tab_Array: any = ['CertificationTypes', 'CompnayCodes', 'CompnayTypes', 'CompnaySizes', "MinorityCodes", "ProjectTypes", "DocumentTypes", "PrimeWorkPerformed", "CSIDivisionWorkPerformed", "ScheduleOfValueItem", "PerformanceReasons", "PaymentFor", "PaymentType", "Frequency", "UnitOfMeasure", "EquipmentType", "Notes", "ContractType", "Department"];
  currrent_tab: string = "CertificationTypes";
  CertificationTypes_data: any;
  CertificationTypes_data_tmp: any;
  CompnayTypes_data: any;
  CompnayTypes_data_tmp: any;
  CompnaySizes_data: any;
  CompnaySizes_data_tmp: any;
  MinorityCodes_data: any;
  MinorityCodes_data_tmp: any;
  ProjectTypes_data: any;
  ProjectTypes_data_tmp: any;
  DocumentTypes_data: any;
  DocumentTypes_data_tmp: any;
  PrimeWorkPerformed_data: any;
  PrimeWorkPerformed_data_tmp: any;
  CSIDivisionWorkPerformed_data: any;
  CSIDivisionWorkPerformed_data_tmp: any;
  ScheduleOfValueItem_data: any;
  ScheduleOfValueItem_data_tmp: any;
  PerformanceReasons_data: any;
  PerformanceReasons_data_tmp: any;
  PaymentFor_data: any;
  PaymentFor_data_tmp: any;
  PaymentType_data: any;
  PaymentType_data_tmp: any;
  Frequency_data: any;
  Frequency_data_tmp: any;
  UnitOfMeasure_data: any;
  UnitOfMeasure_data_tmp: any;
  EquipmentType_data: any;
  EquipmentType_data_tmp: any;
  Contract_data: any;
  Contract_data_tmp: any;
  Department_data: any;
  Department_data_tmp: any;
  Contractvalue: any;
  Departmentvalue: any;




  CertificationTypesValue: any;
  CompnayCodesValue: any;
  CompnayTypesValue: any;
  CompnaySizesValue: any;
  MinorityCodesValue: any;
  ProjectTypesValue: any;
  DocumentTypesValue: any;
  PrimeWorkPerformedValue: any;
  CSIDivisionWorkPerformedValue: any;
  ScheduleOfValueItemValue: any;
  PerformanceReasonsValue: any;
  PaymentForValue: any;

  ngOnInit(): void {
    const token = localStorage.getItem(localstorageconstants.SUPPLIERTOKEN);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    let that = this;
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutesv2.PORTAL_ROVUK_SPONSOR_DATABASE_GET_COMPNAY_CODE,
            dataTablesParameters, { headers: headers }
          ).subscribe(resp => {

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data
            });
          });
      },

      columns: that.getColumName(),

      "drawCallback": () => {
        $('.buttonEditClass_toolbox').on('click', (event) => {
          console.log('Edit press')
          var tmpObjetc = event.target.getAttribute("edit_tmp_id");
          that.getOneCompnayCode(tmpObjetc);
          // that.router.navigate(['/superadmin/companyform'], { queryParams: { id: tmpObjetc } });
        });
        $('.buttonDeleteClass_toolbox').on('click', (event) => {
          this.deletesetting({ _id: event.target.getAttribute("edit_tmp_id") });
        });
      }
    };
    this.dtOptionsScheduleOfItem = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutesv2.PORTAL_ROVUK_SPONSOR_DATABASE_GET_SCHEDULE_OF_VALUE_ITEM,
            dataTablesParameters, { headers: headers }
          ).subscribe(resp => {

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data
            });
          });
      },
      columns: that.getScheduleItemColumName(),
      "drawCallback": () => {
        $('.buttonEditClass_toolbox').on('click', (event) => {
          var tmpObjetc = event.target.getAttribute("edit_tmp_id");
          console.log("tmpObjetc", tmpObjetc);
          that.getOneScheduleValueItem(tmpObjetc);
          // that.router.navigate(['/superadmin/companyform'], { queryParams: { id: tmpObjetc } });
        });
        $('.buttonDeleteClass_toolbox').on('click', (event) => {
          this.deletesetting({ _id: event.target.getAttribute("edit_tmp_id") });
        });
      }
    };
    this.AdminCertificationTypes();
    this.AdminCompnayCodes();
    this.AdminCompnayTypes();
    this.AdminCompnaySizes();
    this.AdminMinorityCodes();
    this.AdminProjectTypes();
    this.AdminDocumentTypes();
    this.AdminPrimeWorkPerformed();
    this.AdminCSIDivisionWorkPerformed();
    this.AdminScheduleOfValueItem();
    this.AdminPerformanceReasons();
    this.AdminPaymentFor();
    this.AdminPaymentType();
    this.AdminFrequency();
    this.AdminUnitOfMeasure();
    this.AdminEquipmentType();
    this.AdminNotes();
    this.AdminContracType();
    this.AdminDepartment();

  }

  getColumName() {
    let that = this;
    return [
      {
        title: that.category_name,
        data: 'category_name',
        defaultContent: ""
      },
      {
        title: that.category_code,
        data: 'category_code',
        defaultContent: ""
      },
      {
        title: that.sub_category_code,
        data: 'sub_category_code',
        defaultContent: ""
      },
      {
        title: that.sub_category_code_name,
        data: 'sub_category_code_name',
        defaultContent: ""
      },
      {
        title: that.Superadmin_Distributorlist_Action,
        render: function (data: any, type: any, full: any) {
          let full_data = JSON.stringify(full);
          return `<div class="dropdown">
            <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  edit_tmp_id=`+ full._id + ` aria-hidden="true"></i>
            <div class="dropdown-content-cust">
              <a edit_tmp_id=`+ full._id + ` class="buttonEditClass_toolbox" ><img src="` + that.editIcon + `" alt="" class="" height="15px">Edit</a>
              <a edit_tmp_id=`+ full._id + ` class="buttonDeleteClass_toolbox"><img src="` + that.deleteIcon + `" alt="" class="" height="15px">Delete</a>
            </div>
        </div>`;


        },
        width: "4%",
        orderable: false
      }
    ];
  }

  getScheduleItemColumName() {
    let that = this;
    return [
      {
        title: that.CSIDivisionWorkPerformed_Text,
        data: 'csi_division_name',
        defaultContent: ""
      },
      {
        title: that.ScheduleOfValueItem_Text,
        data: 'name',
        defaultContent: ""
      },
      {
        title: that.Superadmin_Distributorlist_Action,
        render: function (data: any, type: any, full: any) {
          let full_data = JSON.stringify(full);
          return `<div class="dropdown">
            <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust"  edit_tmp_id=`+ full._id + ` aria-hidden="true"></i>
            <div class="dropdown-content-cust">
               <a edit_tmp_id=`+ full._id + ` class="buttonEditClass_toolbox" ><img src="` + that.editIcon + `" alt="" class="" height="15px">Edit</a>
              <a edit_tmp_id=`+ full._id + ` class="buttonDeleteClass_toolbox"><img src="` + that.deleteIcon + `" alt="" class="" height="15px">Delete</a>
            </div>
        </div>`;
        },
        width: "4%",
        orderable: false
      }
    ];
  }

  addOtherSetting(reqData: any, SettingType: any, name: any, tmp_name: any): void {
    let that = this;
    const dialogRef = this.dialog.open(Sponsorsettingform, {
      data: {
        csiDivisonList: that.CSIDivisionWorkPerformed_data,
        reqData: reqData,
        SettingType: SettingType,
        name: name,
        tmp_name: tmp_name
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      if (that.currrent_tab == "CertificationTypes") {
        that.AdminCertificationTypes();
      }
      if (that.currrent_tab == "CompnayCodes") {
        that.refrshDatabase();
      }
      if (that.currrent_tab == "CompnayTypes") {
        that.AdminCompnayTypes();
      }
      if (that.currrent_tab == "CompnaySizes") {
        that.AdminCompnaySizes();
      }
      if (that.currrent_tab == "MinorityCodes") {
        that.AdminMinorityCodes();
      }
      if (that.currrent_tab == "ProjectTypes") {
        that.AdminProjectTypes();
      }
      if (that.currrent_tab == "DocumentTypes") {
        that.AdminDocumentTypes();
      }
      if (that.currrent_tab == "PrimeWorkPerformed") {
        that.AdminPrimeWorkPerformed();
      }
      if (that.currrent_tab == "CSIDivisionWorkPerformed") {
        that.AdminCSIDivisionWorkPerformed();
      }
      if (that.currrent_tab == "ScheduleOfValueItem") {
        that.refrshDatabase();
      }
      if (that.currrent_tab == "PerformanceReasons") {
        that.AdminPerformanceReasons();
      }
      if (that.currrent_tab == "PaymentFor") {
        that.AdminPaymentFor();
      }
      if (that.currrent_tab == "PaymentType") {
        that.AdminPaymentType();
      }
      if (that.currrent_tab == "Frequency") {
        that.AdminFrequency();
      }
      if (that.currrent_tab == "UnitOfMeasure") {
        that.AdminUnitOfMeasure();
      }
      if (that.currrent_tab == "EquipmentType") {
        that.AdminEquipmentType();
      } else if (that.currrent_tab == "Notes") {
        that.AdminNotes();
      } else if (that.currrent_tab == "ContractType") {
        that.AdminContracType();
      } else if (that.currrent_tab == "Department") {
        that.AdminDepartment();
      }

    });
  }

  addCertificateType(reqData: any, SettingType: any, name: any, tmp_name: any, parentId: any) {
    let that = this;
    const dialogRef = this.dialog.open(CertificateDocumentForm, {
      data: {
        reqData: reqData,
        SettingType: SettingType,
        name: name,
        tmp_name: tmp_name,
        parentId: parentId
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      that.AdminCertificationTypes();
    });
  }

  onTabChanged($event: any) {
    this.currrent_tab = this.tab_Array[$event.index];
  }

  deletesetting(data: any) {
    let that = this, url: any;
    if (that.currrent_tab == "CertificationTypes") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_CRERIFICATION;
    } else if (that.currrent_tab == "CompnayCodes") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_COMPNAY_CODE;
    } else if (that.currrent_tab == "CompnayTypes") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_COMPNAY_TYPE;
    } else if (that.currrent_tab == "CompnaySizes") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_COMPNAY_SIZE;
    } else if (that.currrent_tab == "MinorityCodes") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_MINORITY_CODE;
    } else if (that.currrent_tab == "ProjectTypes") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_PROJECT_TYPE;
    } else if (that.currrent_tab == "DocumentTypes") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_DOCUMENT_TYPE;
    } else if (that.currrent_tab == "PrimeWorkPerformed") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_PRIME_WORK_PERFORMED;
    } else if (that.currrent_tab == "CSIDivisionWorkPerformed") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_CSIDIVISION_WORK_PERFORMED;
    } else if (that.currrent_tab == "ScheduleOfValueItem") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_SCHEDULE_OF_VALUE_ITEM;
    } else if (that.currrent_tab == "PerformanceReasons") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_PERFORMANCE_REASON;
    } else if (that.currrent_tab == "PaymentFor") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_PAYMENT_FOR;
    } else if (that.currrent_tab == "PaymentType") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_PAYMENT_TYPE;
    } else if (that.currrent_tab == "Frequency") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_FREQUENCY;
    } else if (that.currrent_tab == "UnitOfMeasure") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_UNIT_OF_MEASURE;
    } else if (that.currrent_tab == "EquipmentType") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_EQUIPMENT_TYPE;
    } else if (that.currrent_tab == "Notes") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_NOTE_TYPE;
    } else if (that.currrent_tab == "ContractType") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_CONTRACT_TYPE;
    } else if (that.currrent_tab == "Department") {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_DELETE_DEPARTMENT;
    }

    swalWithBootstrapButtons.fire({
      title: this.Settings_Other_Do_Want_Delete,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        that.httpCall.httpPostCall(url, { _id: data._id }).subscribe(function (params) {

          if (params.status) {
            that.sb.openSnackBar(params.message, "success");
            if (that.currrent_tab == "CertificationTypes") {
              that.AdminCertificationTypes();
            }
            if (that.currrent_tab == "CompnayCodes") {
              that.refrshDatabase();
            } if (that.currrent_tab == "CompnayTypes") {
              that.AdminCompnayTypes();
            }
            if (that.currrent_tab == "CompnaySizes") {
              that.AdminCompnaySizes();
            }
            if (that.currrent_tab == "MinorityCodes") {
              that.AdminMinorityCodes();
            }
            if (that.currrent_tab == "ProjectTypes") {
              that.AdminProjectTypes();
            }
            if (that.currrent_tab == "DocumentTypes") {
              that.AdminDocumentTypes();
            }
            if (that.currrent_tab == "PrimeWorkPerformed") {
              that.AdminPrimeWorkPerformed();
            }
            if (that.currrent_tab == "CSIDivisionWorkPerformed") {
              that.AdminCSIDivisionWorkPerformed();
            }
            if (that.currrent_tab == "ScheduleOfValueItem") {
              that.refrshDatabase();
            }
            if (that.currrent_tab == "PerformanceReasons") {
              that.AdminPerformanceReasons();
            }
            if (that.currrent_tab == "PaymentFor") {
              that.AdminPaymentFor();
            }
            if (that.currrent_tab == "PaymentType") {
              that.AdminPaymentType();
            }
            if (that.currrent_tab == "Frequency") {
              that.AdminFrequency();
            }
            if (that.currrent_tab == "UnitOfMeasure") {
              that.AdminUnitOfMeasure();
            }
            if (that.currrent_tab == "EquipmentType") {
              that.AdminEquipmentType();
            }
            if (that.currrent_tab == "Notes") {
              that.AdminNotes();
            }
            if (that.currrent_tab == "ContractType") {
              that.AdminContracType();
            }
            if (that.currrent_tab == "Department") {
              that.AdminDepartment();
            }
          }
          else {
            that.sb.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }

  AdminCertificationTypes() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_CRERIFICATION).subscribe(function (params: any) {
      if (params.status) {
        self.CertificationTypes_data = params.data;
        self.CertificationTypes_data_tmp = params.data;
      }
    });
  }

  getOneCompnayCode(_id: any) {
    let self = this;
    this.httpCall.httpPostCall(httproutesv2.PORTAL_ROVUK_SPONSOR_ONE_GET_COMPNAY_CODE, { _id: _id }).subscribe(function (params: any) {
      if (params.status) {
        self.addOtherSetting(params.data, 'CompnayCodes', 'CompnayCodes', 'category_name');
      }
    });
  }

  getOneScheduleValueItem(_id: any) {
    let self = this;
    this.httpCall.httpPostCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_ONE_SCHEDULE_OF_VALUE_ITEM, { _id: _id }).subscribe(function (params: any) {
      if (params.status) {
        console.log("params code", params);
        self.addOtherSetting(params.data, 'ScheduleOfValueItem', 'ScheduleOfValueItem', 'ScheduleOfValueItem');
      }
    });
  }
  AdminNotes() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_NOTE_TYPE).subscribe(function (params: any) {
      if (params.status) {
        self.Note_data = params.data;
        self.Note_data_tmp = params.data;
      }
    });
  }
  AdminContracType() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_CONTRACT_TYPE).subscribe(function (params: any) {
      if (params.status) {
        self.Contract_data = params.data;
        self.Contract_data_tmp = params.data;
      }
    });
  }

  AdminDepartment() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_DEPARTMENT).subscribe(function (params: any) {
      if (params.status) {
        self.Department_data = params.data;
        self.Department_data_tmp = params.data;
      }
    });
  }

  AdminCompnayCodes() {
    let self = this;
    this.show_hide_table = false;
    setTimeout(() => {
      self.show_hide_table = true;
    }, 2000);
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_COMPNAY_CODE).subscribe(function (params: any) {
      if (params.status) {
        self.CompnayCodes_data = params.data;
        self.CompnayCodes_data_tmp = params.data;
      }
    });
  }

  AdminCompnayTypes() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_COMPNAY_TYPE).subscribe(function (params: any) {
      if (params.status) {
        self.CompnayTypes_data = params.data;
        self.CompnayTypes_data_tmp = params.data;
      }
    });
  }

  AdminCompnaySizes() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_COMPNAY_SIZE).subscribe(function (params: any) {
      if (params.status) {
        self.CompnaySizes_data = params.data;
        self.CompnaySizes_data_tmp = params.data;
      }
    });
  }

  AdminMinorityCodes() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_MINORITY_CODE).subscribe(function (params: any) {
      if (params.status) {
        self.MinorityCodes_data = params.data;
        self.MinorityCodes_data_tmp = params.data;
      }
    });
  }

  AdminProjectTypes() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_PROJECT_TYPE).subscribe(function (params: any) {
      if (params.status) {
        self.ProjectTypes_data = params.data;
        self.ProjectTypes_data_tmp = params.data;
      }
    });
  }

  AdminDocumentTypes() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_DOCUMENT_TYPE).subscribe(function (params: any) {
      if (params.status) {
        self.DocumentTypes_data = params.data;
        self.DocumentTypes_data_tmp = params.data;
      }
    });
  }

  AdminPrimeWorkPerformed() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_PRIME_WORK_PERFORMED).subscribe(function (params: any) {
      if (params.status) {
        self.PrimeWorkPerformed_data = params.data;
        self.PrimeWorkPerformed_data_tmp = params.data;
      }
    });
  }

  AdminScheduleOfValueItem() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_SCHEDULE_OF_VALUE_ITEM).subscribe(function (params: any) {
      if (params.status) {
        self.ScheduleOfValueItem_data = params.data;
        self.ScheduleOfValueItem_data_tmp = params.data;
      }
    });
  }

  AdminPerformanceReasons() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_PERFORMANCE_REASON).subscribe(function (params: any) {
      if (params.status) {
        self.PerformanceReasons_data = params.data;
        self.PerformanceReasons_data_tmp = params.data;
      }
    });
  }

  AdminPaymentFor() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_PAYMENT_FOR).subscribe(function (params: any) {
      if (params.status) {
        self.PaymentFor_data = params.data;
        self.PaymentFor_data_tmp = params.data;
      }
    });
  }

  AdminPaymentType() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_PAYMENT_TYPE).subscribe(function (params: any) {
      if (params.status) {
        self.PaymentType_data = params.data;
        self.PaymentType_data_tmp = params.data;
      }
    });
  }

  AdminFrequency() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_FREQUENCY).subscribe(function (params: any) {
      if (params.status) {
        self.Frequency_data = params.data;
        self.Frequency_data_tmp = params.data;
      }
    });
  }

  AdminUnitOfMeasure() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_UNIT_OF_MEASURE).subscribe(function (params: any) {
      if (params.status) {
        self.UnitOfMeasure_data = params.data;
        self.UnitOfMeasure_data_tmp = params.data;
      }
    });
  }

  AdminEquipmentType() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_EQUIPMENT_TYPE).subscribe(function (params: any) {
      if (params.status) {
        self.EquipmentType_data = params.data;
        self.EquipmentType_data_tmp = params.data;
      }
    });
  }

  refrshDatabase() {
    let that = this;
    this.show_hide_table = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.dtOptions.columns = this.getColumName();
    this.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    this.dtOptionsScheduleOfItem.columns = this.getScheduleItemColumName();
    this.dtOptionsScheduleOfItem.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    setTimeout(() => {
      that.show_hide_table = true;
    }, 1000);
  }

  AdminCSIDivisionWorkPerformed() {
    let self = this;
    this.httpCall.httpGetCall(httproutesv2.PORTAL_ROVUK_SPONSOR_GET_CSIDIVISION_WORK_PERFORMED).subscribe(function (params: any) {
      if (params.status) {
        self.CSIDivisionWorkPerformed_data = params.data;
        self.CSIDivisionWorkPerformed_data_tmp = params.data;
      }
    });
  }

  onFileChange(ev: any, type: any) {

    let that = this;
    let workBook: any = null;
    let jsonData = null;
    let header_: any;

    const reader = new FileReader();
    const file = ev.target.files[0];

    reader.readAsBinaryString(file);
    reader.onload = (event) => {

      const data = reader.result;

      workBook = XLSX.read(data, { type: 'binary' });
      that.uiSpinner.spin$.next(true);
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        let data = (XLSX.utils.sheet_to_json(sheet, { header: 1 }));

        header_ = data.shift();

        return initial;
      }, {});

      let url_import = "";
      let keys_OLD: any = [
      ];
      console.log("header_", type, header_);

      if (type == "CertificationTypes") {

        // url_import = httproutesv2.SUPERADMIN_ROVUK_SPONSOR_IMPORT_CRERIFICATION;
        keys_OLD = [
          'certification_types', 'is_expiration'
        ];

      } else if (type == "CompnayCodes") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_ONE_IMPORT_COMPNAY_CODE;
        keys_OLD = [
          'NAICS Codes'
        ];

      } else if (type == "CompnayTypes") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_COMPNAY_TYPE;
        keys_OLD = [
          'name'
        ];
      } else if (type == "CompnaySizes") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_COMPNAY_SIZE;
        keys_OLD = [
          'name'
        ];
      } else if (type == "MinorityCodes") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_MINORITY_CODE;
        keys_OLD = [
          'name', 'description'
        ];
      } else if (type == "ProjectTypes") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_PROJECT_TYPE;
        keys_OLD = [
          'name'
        ];
      } else if (type == "DocumentTypes") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_DOCUMENT_TYPE;
        keys_OLD = [
          'name', 'is_expiration'
        ];
      } else if (type == "PrimeWorkPerformed") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_PRIME_WORK_PERFORMED;
        keys_OLD = [
          'name'
        ];
      } else if (type == "CSIDivisionWorkPerformed") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_CSIDIVISION_WORK_PERFORMED;
        keys_OLD = [
          'name'
        ];
      } else if (type == "ScheduleOfValueItem") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_SCHEDULE_OF_VALUE_ITEM;
        keys_OLD = [
          'csi', 'name'
        ];
      } else if (type == "PerformanceReasons") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_PERFORMANCE_REASON;
        keys_OLD = [
          'name'
        ];
      } else if (type == "PaymentFor") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_PAYMENT_FOR;
        keys_OLD = [
          'name'
        ];
      } else if (type == "PaymentType") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_PAYMENT_TYPE;
        keys_OLD = [
          'name'
        ];
      } else if (type == "Frequency") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_FREQUENCY;
        keys_OLD = [
          'name'
        ];
      } else if (type == "UnitOfMeasure") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_UNIT_OF_MEASURE;
        keys_OLD = [
          'name'
        ];
      } else if (type == "EquipmentType") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_EQUIPMENT_TYPE;
        keys_OLD = [
          'name'
        ];
      } else if (type == "Notes") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_NOTE_TYPE;
        keys_OLD = [
          'name'
        ];
      } else if (type == "ContractType") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_CONTRACT_TYPE;
        keys_OLD = [
          'name'
        ];
      } else if (type == "Department") {
        url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_IMPORT_DEPARTMENT;
        keys_OLD = [
          'name'
        ];
      }

      if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header_.sort())) {
        that.sb.openSnackBar("Check excel file format", "error");
        that.uiSpinner.spin$.next(false);
        return;
      } else {
        const formData_profle = new FormData();
        formData_profle.append("file", file);
        that.httpCall.httpPostCall(url_import, formData_profle).subscribe(function (params) {
          if (params.status) {
            if (type == "CertificationTypes") {
              that.AdminCertificationTypes();
            } else if (type == "CompnayCodes") {
              that.refrshDatabase();
            } else if (type == "CompnayTypes") {
              that.AdminCompnayTypes();
            } else if (type == "CompnaySizes") {
              that.AdminCompnaySizes();
            } else if (type == "MinorityCodes") {
              that.AdminMinorityCodes();
            } else if (type == "ProjectTypes") {
              that.AdminProjectTypes();
            } else if (type == "DocumentTypes") {
              that.AdminDocumentTypes();
            } else if (type == "PrimeWorkPerformed") {
              that.AdminPrimeWorkPerformed();
            } else if (type == "CSIDivisionWorkPerformed") {
              that.AdminCSIDivisionWorkPerformed();
            } else if (type == "ScheduleOfValueItem") {
              that.refrshDatabase();
              that.AdminCSIDivisionWorkPerformed();
            } else if (type == "PerformanceReasons") {
              that.AdminPerformanceReasons();
            } else if (type == "PaymentFor") {
              that.AdminPaymentFor();
            } else if (type == "PaymentType") {
              that.AdminPaymentType();
            } else if (type == "Frequency") {
              that.AdminFrequency();
            } else if (type == "UnitOfMeasure") {
              that.AdminUnitOfMeasure();
            } else if (type == "EquipmentType") {
              that.AdminEquipmentType();
            } else if (type == "Notes") {
              that.AdminNotes();
            } else if (type == "ContractType") {
              that.AdminContracType();
            } else if (type == "Department") {
              that.AdminDepartment();
            }
            that.sb.openSnackBar(params.message, "success");
            that.uiSpinner.spin$.next(false);
          } else {
            that.uiSpinner.spin$.next(false);
            that.sb.openSnackBar(params.message, "error");
          }
        });
      }
    };
  }


  importFileActionCompnayCodes() {
    let el: HTMLElement = this.OpenFilebox_CompnayCodes.nativeElement;
    el.click();
  }
  importFileActionCompnayTypes() {
    let el: HTMLElement = this.OpenFilebox_CompnayTypes.nativeElement;
    el.click();
  }

  importFileActionCompnaySizes() {
    let el: HTMLElement = this.OpenFilebox_CompnaySizes.nativeElement;
    el.click();
  }
  importFileActionMinorityCodes() {
    let el: HTMLElement = this.OpenFilebox_MinorityCodes.nativeElement;
    el.click();
  }

  importFileActionProjectTypes() {
    let el: HTMLElement = this.OpenFilebox_ProjectTypes.nativeElement;
    el.click();
  }
  importFileActionDocumentTypes() {
    let el: HTMLElement = this.OpenFilebox_DocumentTypes.nativeElement;
    el.click();
  }
  importFileActionPrimeWorkPerformed() {
    let el: HTMLElement = this.OpenFilebox_PrimeWorkPerformed.nativeElement;
    el.click();
  }
  importFileActionCSIDivisionWorkPerformed() {
    let el: HTMLElement = this.OpenFilebox_CSIDivisionWorkPerformed.nativeElement;
    el.click();
  }
  importFileActionScheduleOfValueItem() {
    let el: HTMLElement = this.OpenFilebox_ScheduleOfValueItem.nativeElement;
    el.click();
  }
  importFileActionPerformanceReasons() {
    let el: HTMLElement = this.OpenFilebox_PerformanceReasons.nativeElement;
    el.click();
  }
  importFileActionPaymentFor() {
    let el: HTMLElement = this.OpenFilebox_PaymentFor.nativeElement;
    el.click();
  }
  importFileActionPaymentType() {
    let el: HTMLElement = this.OpenFilebox_PaymentType.nativeElement;
    el.click();
  }
  importFileActionFrequency() {
    let el: HTMLElement = this.OpenFilebox_Frequency.nativeElement;
    el.click();
  }
  importFileActionUnitOfMeasure() {
    let el: HTMLElement = this.OpenFilebox_UnitOfMeasure.nativeElement;
    el.click();
  }
  importFileActionEquipmentType() {
    let el: HTMLElement = this.OpenFilebox_EquipmentType.nativeElement;
    el.click();
  }
  importFileActionNotesType() {
    let el: HTMLElement = this.OpenFilebox_Notes.nativeElement;
    el.click();
  }
  importFileActionContractType() {
    let el: HTMLElement = this.OpenFilebox_ContractType.nativeElement;
    el.click();
  }
  importFileActionDepartment() {
    let el: HTMLElement = this.OpenFilebox_Department.nativeElement;
    el.click();
  }

  async exportFileAction(type: any) {
    var url_import = "";
    if (type == "CompnayCodes") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_ONE_EXPORT_COMPNAY_CODE;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      let workbook = new Workbook();

      let worksheet = workbook.addWorksheet("NAICS Codes");
      worksheet.mergeCells('A1', 'D1');

      let titleRow = worksheet.getCell('A1');
      titleRow.value = "NAICS Codes";
      titleRow.font = {
        name: 'Calibri',
        size: 16,
        underline: 'single',
        bold: true,
        color: { argb: '0085A3' }
      };
      titleRow.alignment = { vertical: 'middle', horizontal: 'center' };

      let CategoryRow = worksheet.addRow(["Category"]);
      CategoryRow.alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.mergeCells(`A2:B2`);

      worksheet.mergeCells(`C2:D2`);
      let SubcategoryRow = worksheet.getCell('C2');
      SubcategoryRow.value = "Subcategory";

      worksheet.addRow(["Code", "Tittle", "Code", "Tittle"]);
      var last_used = 3;
      data_export.data.forEach((element: any) => {
        for (let m = 0; m < element.data.length; m++) {
          if ((element.data.length - 1) == m) {
            worksheet.addRow(["", "",
              element.data[m].sub_category_code, element.data[m].sub_category_code_name]);
            worksheet.mergeCells(`A${last_used + 1}:A${last_used + element.data.length}`);
            worksheet.mergeCells(`B${last_used + 1}:B${last_used + element.data.length}`);
            let tmpcodeRow = worksheet.getCell(`A${last_used + 1}`);
            tmpcodeRow.value = element.data[m].category_code;
            tmpcodeRow.alignment = { vertical: 'middle', horizontal: 'center' };
            let tmpSatarow = worksheet.getCell(`B${last_used + 1}`);
            tmpSatarow.value = element.data[m].category_name;
            tmpSatarow.alignment = { vertical: 'middle', horizontal: 'center' };
            last_used = last_used + element.data.length;
          } else {
            worksheet.addRow(["", "", element.data[m].sub_category_code, element.data[m].sub_category_code_name]);
          }
        }
      });

      workbook.xlsx.writeBuffer().then((data) => {
        let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        fs.saveAs(blob, "compnay_code_" + new Date().getTime() + '.xlsx');
      });

    } else if (type == "CompnayTypes") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_COMPNAY_TYPE;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      console.log("data_export", data_export);
      this.excelWithName(data_export, "CompanyType", "name");

    } else if (type == "CompnaySizes") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_COMPNAY_SIZE;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "CompnaySize", "name");

    } else if (type == "MinorityCodes") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_MINORITY_CODE;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithNameAndDesc(data_export, "MinorityCode", ["name", "description"]);

    } else if (type == "ProjectTypes") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_PROJECT_TYPE;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      console.log("data_export", data_export);
      this.excelWithName(data_export, "ProjectType", "name");

    } else if (type == "DocumentTypes") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_DOCUMENT_TYPE;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      console.log("data_export", data_export);
      this.excelWithNameAndExper(data_export, "DocumentType", ["name", "is_expiration"]);
    } else if (type == "PrimeWorkPerformed") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_PRIME_WORK_PERFORMED;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "PrimeWorkPerformed", "name");
    } else if (type == "CSIDivisionWorkPerformed") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_CSIDIVISION_WORK_PERFORMED;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "CSIDivisionWorkPerformed", "name");
    } else if (type == "ScheduleOfValueItem") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_SCHEDULE_OF_VALUE_ITEM;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "ScheduleOfValueItem", "name");
    } else if (type == "PerformanceReasons") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_PERFORMANCE_REASON;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "PerformanceReasons", "name");
    } else if (type == "PaymentFor") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_PAYMENT_FOR;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "PaymentFor", "name");
    } else if (type == "PaymentType") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_PAYMENT_TYPE;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "PaymentType", "name");
    } else if (type == "Frequency") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_FREQUENCY;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "Frequency", "name");
    } else if (type == "UnitOfMeasure") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_UNIT_OF_MEASURE;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "UnitOfMeasure", "name");
    } else if (type == "EquipmentType") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_EQUIPMENT_TYPE;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "EquipmentType", "name");
    } else if (type == "Notes") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_NOTE_TYPE;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "Notes", "name");
    } else if (type == "ContractType") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_CONTRACT_TYPE;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "ContractType", "name");
    } else if (type == "Department") {
      url_import = httproutesv2.PORTAL_ROVUK_SPONSOR_EXPORT_DEPARTMENT;
      this.sb.openSnackBar(this.Export_file_message, "success");
      let data_export = await this.httpCall.httpGetCall(url_import).toPromise();
      this.excelWithName(data_export, "Department", "name");
    }

  }

  async excelWithName(data: any, title: any, colum_name: any) {
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(title);
    let titleRow = worksheet.getCell('A1');
    titleRow.value = colum_name;
    titleRow.font = {
      name: 'Calibri',
      size: 16,
      bold: true,
    };
    titleRow.alignment = { vertical: 'middle', horizontal: 'center' };
    data.data.forEach((element: any) => {
      worksheet.addRow([element.name]);
    });
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + "_" + new Date().getTime() + '.xlsx');
    });
  }

  async excelWithNameAndDesc(data: any, title: any, colum_name: any) {
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(title);
    worksheet.addRow(colum_name);
    data.data.forEach((element: any) => {
      worksheet.addRow([element.name, element.description]);
    });
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + "_" + new Date().getTime() + '.xlsx');
    });
  }

  async excelWithNameAndExper(data: any, title: any, colum_name: any) {
    let workbook = new Workbook();
    let worksheet = workbook.addWorksheet(title);
    worksheet.addRow(colum_name);
    data.data.forEach((element: any) => {
      let tnp_yes_no = element.is_expiration ? "Yes" : "No";
      worksheet.addRow([element.name, tnp_yes_no]);
    });
    workbook.xlsx.writeBuffer().then((data) => {
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + "_" + new Date().getTime() + '.xlsx');
    });
  }


}

@Component({
  selector: 'rovuksponsor-setting-form',
  templateUrl: './sponsor-setting-form.html',
  styleUrls: ['./ocps-settings.component.scss']
})

export class Sponsorsettingform implements OnInit {

  public othersetting: FormGroup;
  name: any;
  tmp_name: any = "";
  public variablesmanufacturerList: any = [];
  public manufacturerList = this.variablesmanufacturerList.slice();
  csiDivisonList: any;
  subscription: Subscription;
  mode: any;
  backIcon: string;
  saveIcon = icon.SAVE_WHITE;

  constructor(public dialogRef: MatDialogRef<Sponsorsettingform>, private modeService: ModeDetectService, public translate: TranslateService, public sb: Snackbarservice,
    public formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any, public httpCall: HttpCall) {
    console.log("data: ", data)
    let new_csi_division_id;
    let new_name;
    let new_number;
    let is_expiration;
    let new_description;
    this.csiDivisonList = data.csiDivisonList;
    this.name = data.name;
    this.tmp_name = data.tmp_name;
    this.othersetting = this.formBuilder.group({
      csi_division_id: [""],
      name: ["", Validators.required],
      minoritydescription: [""],
      is_expiration: new FormControl(false),
      category_code: [],
      sub_category_code: [],
      sub_category_code_name: []
    });

    let category_code, sub_category_code, sub_category_code_name;
    if (this.data.SettingType)
      if (this.data.reqData._id) {
        if (this.data.SettingType == "CertificationTypes") {
          new_name = this.data.reqData.name;
          new_description = this.data.reqData.description;
          is_expiration = this.data.reqData.is_expiration;
        } else if (this.data.SettingType == "CompnayCodes") {
          new_name = this.data.reqData.category_name;
          category_code = this.data.reqData.category_code;
          sub_category_code = this.data.reqData.sub_category_code;
          sub_category_code_name = this.data.reqData.sub_category_code_name;
        } else if (this.data.SettingType == "CompnayTypes") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "CompnaySizes") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "MinorityCodes") {
          new_name = this.data.reqData.name;
          new_description = this.data.reqData.description;
        } else if (this.data.SettingType == "ProjectTypes") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "DocumentTypes") {
          new_name = this.data.reqData.name;
          is_expiration = this.data.reqData.is_expiration;
        } else if (this.data.SettingType == "PrimeWorkPerformed") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "CSIDivisionWorkPerformed") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "ScheduleOfValueItem") {
          new_csi_division_id = this.data.reqData.csi_division_id;
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "PerformanceReasons") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "PaymentFor") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "PaymentType") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "Frequency") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "UnitOfMeasure") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "EquipmentType") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "Notes") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "ContractType") {
          new_name = this.data.reqData.name;
        } else if (this.data.SettingType == "Department") {
          new_name = this.data.reqData.name;
        }
        this.othersetting = this.formBuilder.group({
          csi_division_id: [new_csi_division_id],
          name: [new_name, Validators.required],
          minoritydescription: [new_description],
          is_expiration: new FormControl(is_expiration),
          category_code: [category_code],
          sub_category_code: [sub_category_code],
          sub_category_code_name: [sub_category_code_name]
        });

        if (this.data.SettingType == "CompnayCodes") {
          this.othersetting.get('category_code')!.setValidators([Validators.required]);
          this.othersetting.get('category_code')!.updateValueAndValidity();

          this.othersetting.get('sub_category_code')!.setValidators([Validators.required]);
          this.othersetting.get('sub_category_code')!.updateValueAndValidity();


          this.othersetting.get('sub_category_code_name')!.setValidators([Validators.required]);
          this.othersetting.get('sub_category_code_name')!.updateValueAndValidity();
        }
        if (this.data.SettingType == "ScheduleOfValueItem") {
          this.othersetting.get('csi_division_id')!.setValidators([Validators.required]);
          this.othersetting.get('csi_division_id')!.updateValueAndValidity();
        }
      }
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    console.log("this.mode main", this.mode);
    if (this.mode == 'off') {
      console.log("this.mod", this.mode);
      this.backIcon = icon.BACK;


    } else {
      console.log("this.mod else", this.mode);
      this.backIcon = icon.BACK_WHITE;


    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;

      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;

      }
      console.log("DARK MODE: " + this.mode);
    });
  }

  ngOnInit(): void { }

  saveData() {
    let url, reqObject: any;
    let that = this;
    let formvalue = this.othersetting.value;
    if (this.othersetting.valid) {

      if (this.data.SettingType == "CertificationTypes") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_CRERIFICATION;
        reqObject = {
          name: formvalue.name,
          is_expiration: formvalue.is_expiration
        };
      } else if (this.data.SettingType == "CompnayCodes") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_COMPNAY_CODE;
        reqObject = {
          category_name: formvalue.name,
          category_code: formvalue.category_code,
          sub_category_code: formvalue.sub_category_code,
          sub_category_code_name: formvalue.sub_category_code_name
        };
      } else if (this.data.SettingType == "CompnayTypes") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_COMPNAY_TYPE;

        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "CompnaySizes") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_COMPNAY_SIZE;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "MinorityCodes") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_MINORITY_CODE;
        reqObject = {
          name: formvalue.name,
          description: formvalue.minoritydescription
        };
      } else if (this.data.SettingType == "ProjectTypes") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_PROJECT_TYPE;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "DocumentTypes") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_DOCUMENT_TYPE;
        reqObject = {
          name: formvalue.name,
          is_expiration: formvalue.is_expiration
        };
      } else if (this.data.SettingType == "PrimeWorkPerformed") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_PRIME_WORK_PERFORMED;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "CSIDivisionWorkPerformed") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_CSIDIVISION_WORK_PERFORMED;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "ScheduleOfValueItem") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_SCHEDULE_OF_VALUE_ITEM;
        reqObject = {
          csi_division_id: formvalue.csi_division_id,
          name: formvalue.name
        };
      } else if (this.data.SettingType == "PerformanceReasons") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_PERFORMANCE_REASON;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "PaymentFor") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_PAYMENT_FOR;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "PaymentType") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_PAYMENT_TYPE;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "Frequency") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_FREQUENCY;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "UnitOfMeasure") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_UNIT_OF_MEASURE;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "EquipmentType") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_EQUIPMENT_TYPE;
        reqObject = {
          name: formvalue.name
        };
      }
      else if (this.data.SettingType == "Notes") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_NOTE_TYPE;
        reqObject = {
          name: formvalue.name
        };
      } else if (this.data.SettingType == "ContractType") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_CONTRACT_TYPE;
        reqObject = {
          name: formvalue.name,
          is_expiration: formvalue.is_expiration
        };
      } else if (this.data.SettingType == "Department") {
        url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_DEPARTMENT;
        reqObject = {
          name: formvalue.name
        };
      }
    }

    if (this.data.reqData._id) {
      reqObject._id = this.data.reqData._id;
    }
    this.httpCall.httpPostCall(url, reqObject).subscribe(function (params: any) {
      if (params.status) {
        that.sb.openSnackBar(params.message, "success");
        that.dialogRef.close();
      } else {
        that.sb.openSnackBar(params.message, "error");
      }
    });
  }
}

@Component({
  selector: 'add-certificate-document-type-form',
  templateUrl: './add-certificate-document-type-form.html',
  styleUrls: ['./ocps-settings.component.scss']
})

export class CertificateDocumentForm implements OnInit {

  public othersetting: FormGroup;
  name: any;
  tmp_name: any = "";
  subscription: Subscription;
  mode: any;
  backIcon: string;
  saveIcon = icon.SAVE_WHITE;

  constructor(public dialogRef: MatDialogRef<CertificateDocumentForm>, private modeService: ModeDetectService, public translate: TranslateService, public sb: Snackbarservice,
    public formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) public data: any, public httpCall: HttpCall) {
    console.log("data: ", data);
    let new_name;
    let is_expiration = false;
    this.name = data.name;
    this.tmp_name = data.tmp_name;
    this.othersetting = this.formBuilder.group({
      name: ["", Validators.required],
      is_expiration: new FormControl(false),
    });

    if (this.data.SettingType)
      if (this.data.reqData._id) {
        new_name = this.data.reqData.name;
        // new_description = this.data.reqData.description;
        is_expiration = this.data.reqData.is_expiration;
      }
    this.othersetting = this.formBuilder.group({
      name: [new_name, Validators.required],
      is_expiration: new FormControl(is_expiration),
    });
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.backIcon = icon.BACK;
    } else {
      this.backIcon = icon.BACK_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.BACK;
      } else {
        this.mode = 'on';
        this.backIcon = icon.BACK_WHITE;
      }
    });
  }

  ngOnInit(): void { }

  saveData() {
    let url, reqObject: any;
    let that = this;
    let formvalue = this.othersetting.value;
    if (this.othersetting.valid) {
      url = httproutesv2.PORTAL_ROVUK_SPONSOR_SAVE_CRERIFICATION;
      reqObject = {
        name: formvalue.name,
        is_expiration: formvalue.is_expiration,
        parent_type_id: that.data.parentId,
        is_parent: false,
      };
    }

    if (this.data.reqData._id) {
      reqObject._id = this.data.reqData._id;
    }
    this.httpCall.httpPostCall(url, reqObject).subscribe(function (params: any) {
      if (params.status) {
        that.sb.openSnackBar(params.message, "success");
        that.dialogRef.close();
      } else {
        that.sb.openSnackBar(params.message, "error");
      }
    });
  }
}
