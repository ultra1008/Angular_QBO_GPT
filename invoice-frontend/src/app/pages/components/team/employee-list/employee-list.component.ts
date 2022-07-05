import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from '../employee.service';
import { Subject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Mostusedservice } from './../../../../service/mostused.service';
import Swal from 'sweetalert2';
import { HttpCall } from 'src/app/service/httpcall.service';
import { httproutes, httproutesv2, icon, localstorageconstants } from 'src/app/consts';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { formatPhoneNumber, LanguageApp, MMDDYYYY_formet } from 'src/app/service/utils';
import 'datatables.net-responsive';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataTableDirective } from 'angular-datatables';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { configdata } from 'src/environments/configData';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import * as _ from 'lodash';
import * as XLSX from 'xlsx';
import { ModeDetectService } from '../../map/mode-detect.service';
import { saveAs } from 'file-saver';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

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
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})

export class EmployeeListComponent implements OnInit {
  usersArray: any;
  btn_grid_list_text: any;
  listtogrid_text: any;
  gridtolist_text: any;
  sorting_asc: Boolean = false;
  sorting_desc: Boolean = false;
  soruing_all: Boolean = true;
  username_search: any;
  username_status: any;
  gridtolist: Boolean = true;
  addTeamMember: boolean = true;
  deleteTeamMember: boolean = true;
  locallanguage: any;
  isEmployeeData: Boolean = false;
  dtOptions: DataTables.Settings = {};
  User_Card_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  acticve_word: string = "";
  inacticve_word: string = "";
  mode: any;
  subscription: Subscription;
  historyIcon: string;
  trashIcon: string;
  importIcon: string;
  editIcon: string;
  reportIcon: string;
  allRoles = [];
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;

  role_permission: any;

  // We use this trigger because fetching the list of persons can be quite long,
  // thus we ensure the data is fetched before rendering
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild('OpenFilebox') OpenFilebox: any;
  Company_Equipment_File_Not_Match: any;
  constructor(private modeService: ModeDetectService, private router: Router, public mostusedservice: Mostusedservice,
    public employeeservice: EmployeeService, public translate: TranslateService, public dialog: MatDialog,
    public httpCall: HttpCall, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService,) {
    var userdata = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.role_permission = userdata.role_permission.users;
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.historyIcon = icon.HISTORY;
      this.trashIcon = icon.DELETE;
      this.importIcon = icon.IMPORT;
      this.editIcon = icon.EDIT;
      this.reportIcon = icon.REPORT;
    } else {
      this.historyIcon = icon.HISTORY_WHITE;
      this.trashIcon = icon.DELETE_WHITE;
      this.importIcon = icon.IMPORT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.reportIcon = icon.REPORT_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.historyIcon = icon.HISTORY;
        this.trashIcon = icon.DELETE;
        this.importIcon = icon.IMPORT;
        this.editIcon = icon.EDIT;
        this.reportIcon = icon.REPORT;
      } else {
        this.mode = 'on';
        this.historyIcon = icon.HISTORY_WHITE;
        this.trashIcon = icon.DELETE_WHITE;
        this.importIcon = icon.IMPORT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.reportIcon = icon.REPORT_WHITE;
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
    // let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    // if (role_permission.role_permission.team.team.Add == false) {
    //   this.addTeamMember = false;
    // }
    // if (role_permission.role_permission.team.team.Delete == false) {
    //   this.deleteTeamMember = false;
    // }
    this.uiSpinner.spin$.next(true);
    let that = this;

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
        }, 1000);
      }
      i++;
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables
    };
    this.employeeservice.getalluser().subscribe(function (data) {
      that.uiSpinner.spin$.next(false);
      if (data.status) {
        that.isEmployeeData = true;
        that.usersArray = data.data;
      }
    });

    this.mostusedservice.deleteUserEmit$.subscribe(function (editdata) {
      that.employeeservice.getalluser().subscribe(function (data) {
        if (data.status) {
          that.isEmployeeData = true;
          that.usersArray = data.data;
        }
      });
    });

    this.getAllRoles();
  }

  rerenderfunc() {
    this.isEmployeeData = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    this.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    setTimeout(() => {
      that.isEmployeeData = true;
    }, 100);
  }

  ngAfterViewInit() {
    this.dtTrigger.next();
  }

  btnClick() {
    this.router.navigateByUrl('/employee-form');
  }
  viewpageoprn(id: any) {
    this.router.navigateByUrl('/employee-view/' + id);
  }

  phonenoFormat(data: any) {
    return formatPhoneNumber(data);
  }

  gridTolist() {
    if (this.gridtolist) {
      this.rerenderfunc();
      this.btn_grid_list_text = this.listtogrid_text;
      this.gridtolist = false;
    } else {
      this.btn_grid_list_text = this.gridtolist_text;
      this.gridtolist = true;
    }
  }

  sorting_name() {
    if (this.sorting_desc) {
      this.sorting_desc = false;
      this.sorting_asc = true;
      this.soruing_all = false;
      this.usersArray = this.usersArray.sort((a: any, b: any) => a.username.localeCompare(b.username, 'en', { sensitivity: 'base' }));
    } else if (this.sorting_asc) {
      this.sorting_desc = true;
      this.sorting_asc = false;
      this.soruing_all = false;
      this.usersArray = this.usersArray.reverse((a: any, b: any) => a.username.localeCompare(b.username, 'en', { sensitivity: 'base' }));

    } else {
      this.sorting_desc = false;
      this.sorting_asc = true;
      this.soruing_all = false;
      this.usersArray = this.usersArray.sort((a: any, b: any) => a.username.localeCompare(b.username, 'en', { sensitivity: 'base' }));
    }
  }

  searchData(searchValue: any) {
    this.usersArray = this.usersArray.filter((item: any) => {
      return item.username.toLowerCase().includes(searchValue.toLowerCase());
    });
  }

  deleteTimecardButtonClick(id: any) {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: that.User_Card_Do_Want_Delete,
      allowOutsideClick: false,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
    }).then((result) => {
      if (result.isConfirmed) {
        this.httpCall.httpPostCall(httproutes.TEAM_DELETE, { _id: id }).subscribe(function (params) {
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.mostusedservice.userdeleteEmit();
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }

  openHistoryDialog() {
    const dialogRef = this.dialog.open(TeamHistory, {
      height: '500px',
      width: '800px',
      data: {
        employee_id: ""
      },
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  getAllRoles() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_ROLES_ALL).subscribe(function (params) {
      if (params.status) {
        that.allRoles = params.data;
      }
    });
  }

  openReportDialog() {
    const dialogRef = this.dialog.open(TeamReportForm, {
      height: '500px',
      width: '800px',
      data: {
        allRoles: this.allRoles
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  openForImportDownloadDialog() {
    const dialogRef = this.dialog.open(ImportButtonDownload, {
      disableClose: true

    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  openErrorDataDialog(data: any) {
    let that = this;
    const dialogRef = this.dialog.open(BulkUploadErrorData, {
      data: data,
      disableClose: true
    });
    dialogRef.afterClosed().subscribe(result => {
      that.mostusedservice.userdeleteEmit();
    });
  }

  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }
  onFileChange(ev: any) {
    let that = this;
    let workBook: any = null;
    let jsonData = null;
    let header_: any;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' });
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        let data = (XLSX.utils.sheet_to_json(sheet, { header: 1 }));
        header_ = data.shift();

        return initial;
      }, {});
      const dataString = JSON.stringify(jsonData);

      const keys_OLD = ["userfirstname", "userlastname", "useremail", "password", "user_role", "usergender", "userdepartment", "userjob_title", "userjob_type"];
      if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header_.sort())) {
        that.snackbarservice.openSnackBar(that.Company_Equipment_File_Not_Match, "error");
        return;
      } else {
        that.uiSpinner.spin$.next(true);
        const formData_profle = new FormData();
        formData_profle.append("file", file);
        that.httpCall.httpPostCall(httproutes.PORTAL_EMPLOYEE_IMPORT, formData_profle).subscribe(function (params) {
          if (params.status) {
            that.uiSpinner.spin$.next(false);
            that.openErrorDataDialog(params);
            that.mostusedservice.userdeleteEmit();
            //that.snackbarservice.openSnackBar(params.message, "success");
            //that.rerenderfunc();
          } else {
            that.uiSpinner.spin$.next(false);
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    };
    reader.readAsBinaryString(file);
  }

}


@Component({
  selector: 'team-history',
  templateUrl: './team-history.component.html',
  styleUrls: ['./employee-list.component.scss']
})

export class TeamHistory {
  dtOptions: any = {};
  @ViewChild(DataTableDirective, { static: false }) datatableElement: any;
  tmp_Location_History_Listing_Date: any;
  tmp_Location_History_Listing_Name: any;
  tmp_Location_History_Listing_Action: any;
  useremail: any;
  username: any;
  usermiddlename: any;
  lastname: any;
  role_name: any;
  manager_name: any;
  location_name: any;
  userjob_type_name: any;
  userjob_title_name: any;
  department_name: any;
  user_payroll_group_name: any;
  userssn: any;
  userphone: any;
  usersecondary_email: any;
  userstreet1: any;
  userstreet2: any;
  city: any;
  user_state: any;
  userzipcode: any;
  usercountry: any;
  userstartdate: any;
  usersalary: any;
  costcode: any;
  card_no: any;
  action_taken_from: any;
  mobile_all: any;
  web_all: any;
  project_email_group: any;
  project_email_groups: any = configdata.PROJECT_EMAIL_GROUP;
  compliance_officer: any;
  subscription: any;
  mode: any;
  backIcon: any;
  constructor(public httpCall: HttpCall, private modeService: ModeDetectService, public translate: TranslateService, public dialogRef: MatDialogRef<TeamHistory>, private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any, public sb: Snackbarservice) {

  }
  ngOnInit() {
    const that = this;

    const token = localStorage.getItem(localstorageconstants.SUPPLIERTOKEN);
    let headers: any = new HttpHeaders();
    headers = headers.set('Authorization', token);
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    tmp_locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(tmp_locallanguage);
    this.translate.stream(['']).subscribe((textarray) => {
      that.tmp_Location_History_Listing_Date = that.translate.instant('Location_History_Listing_Date');
      that.tmp_Location_History_Listing_Action = that.translate.instant('Location_History_Listing_Action');
      that.tmp_Location_History_Listing_Name = that.translate.instant('Location_History_Listing_Name');
      that.username = that.translate.instant("Agent-username");
      that.useremail = that.translate.instant("Employee-form-Email");
      this.usermiddlename = that.translate.instant("Employee-form-Middle-Name");
      that.role_name = that.translate.instant("Employee-form-User-Role");
      that.manager_name = that.translate.instant("Employee-form-Manager");
      that.location_name = that.translate.instant("Employee-form-Location");
      that.userjob_type_name = that.translate.instant("Employee-form-Job-Type");
      that.userjob_title_name = that.translate.instant("Employee-form-Job-Title");
      that.department_name = that.translate.instant("Employee-form-Department");
      that.user_payroll_group_name = that.translate.instant("Employee-form-Payroll-Group");
      that.userssn = that.translate.instant("Employee-form-SSN");
      that.userphone = that.translate.instant("Emergency-Contact-Form-Phone");
      that.usersecondary_email = that.translate.instant("Employee-form-Secondary-Email");
      that.userstreet1 = that.translate.instant("Employee-form-Street-1");
      that.userstreet2 = that.translate.instant("Employee-form-Street-2");
      that.city = that.translate.instant("Employee-form-City");
      that.user_state = that.translate.instant("Employee-form-State");
      that.userzipcode = that.translate.instant("Employee-form-Zipcode");
      that.usercountry = that.translate.instant("Employee-form-Country");
      that.userstartdate = that.translate.instant("Employee-form-Start-Date");
      that.usersalary = that.translate.instant("Employee-form-Salary-Hourly-Rate");
      that.costcode = that.translate.instant("Employee-form-Cost-Code");
      that.card_no = that.translate.instant("Employee-form-Card-Number");
      that.lastname = that.translate.instant("Employee-form-Last-Name");
      that.action_taken_from = that.translate.instant('action_taken_from');
      that.mobile_all = that.translate.instant('mobile_all');
      that.web_all = that.translate.instant('web_all');
      that.project_email_group = that.translate.instant('project_email_group');
      that.compliance_officer = that.translate.instant('compliance_officer');
    });

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      responsive: true,
      "order": [[0, "desc"]],
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
      ajax: (dataTablesParameters: any, callback: any) => {
        dataTablesParameters.employee_id = this.data.employee_id;
        that.http
          .post<DataTablesResponse>(
            configdata.apiurl + httproutes.TEAMS_HISTORY,
            dataTablesParameters, { headers: headers }
          ).subscribe(resp => {
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: resp.data
            });
          });
      },
      columns: this.getColumn()
    };

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    console.log("this.mode main", this.mode);
    if (this.mode == 'off') {
      console.log("this.mod", this.mode);
      this.backIcon = icon.CANCLE;


    } else {
      console.log("this.mod else", this.mode);
      this.backIcon = icon.CANCLE_WHITE;


    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.backIcon = icon.CANCLE;

      } else {
        this.mode = 'on';
        this.backIcon = icon.CANCLE_WHITE;

      }
      console.log("DARK MODE: " + this.mode);
    });
  }

  getColumn() {
    let that = this;
    return [{
      title: that.tmp_Location_History_Listing_Date,
      defaultContent: "",
      render: function (data: any, type: any, full: any) {
        return MMDDYYYY_formet(full.created_at);
      },

    },
    {
      title: that.tmp_Location_History_Listing_Action,
      data: 'action',
      defaultContent: ""
    },
    {
      title: that.tmp_Location_History_Listing_Name,
      data: 'created_by',
      defaultContent: ""
    },
    {
      title: that.action_taken_from,
      defaultContent: "",
      render: function (data: any, type: any, full: any) {
        if (full.taken_device == "Mobile") {
          return that.mobile_all;
        } else {
          return that.web_all;
        }
      }
    },
    {
      title: '',
      class: "none",
      defaultContent: "",
      render: function (data: any, type: any, full: any) {
        if (full.action == "Delete") {
          return that.userHistoryTable(full.deleted_user);
        } else {
          return that.userHistoryTable(full);
        }
      }
    },
    ];
  }

  userHistoryTable(full: any) {
    let that = this;
    let usersalary = full.usersalary != null || full.usersalary != undefined ? full.usersalary : "";
    let city = full.city != null || full.city != undefined ? full.city : "";
    let userstartdate = full.userstartdate != null && full.userstartdate != "" && full.userstartdate != undefined ? full.userstartdate : "";
    var match = _.find(that.project_email_groups, { 'key': full.project_email_group });
    match = match != undefined ? match.value : "";
    let userstreet2 = full.userstreet2 != null || full.userstreet2 != undefined ? full.userstreet2 : "";
    let compilanceOfficer = full.compliance_officer != null || full.compliance_officer != undefined ? (full.compliance_officer == true ? "Yes" : "No") : "No";
    let html = `<table class="cust-table" >
                    <tr>
                      <th class="cust-backgroud-color">`+ that.useremail + `</th>
                      <td>`+ full.useremail + `</td>
                    </tr>
                    <tr> 
                      <th class="cust-backgroud-color">`+ that.username + `</th>
                      <td>`+ full.username + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.usermiddlename + `</th>
                      <td>`+ full.usermiddlename + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.lastname + `</th>
                      <td>`+ full.userlastname + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.role_name + `</th>
                      <td>`+ full.role_name + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.project_email_group + `</th>
                      <td>`+ match + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.compliance_officer + `</th>
                      <td>`+ compilanceOfficer + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.manager_name + `</th>
                      <td>`+ full.manager_name + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.location_name + `</th>
                      <td>`+ full.location_name + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.userjob_type_name + `</th>
                      <td>`+ full.userjob_type_name + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.userjob_title_name + `</th>
                      <td>`+ full.userjob_title_name + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.department_name + ` </th>
                      <td>`+ full.department_name + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.user_payroll_group_name + `</th>
                      <td>`+ full.user_payroll_group_name + `</td>
                    </tr>
                    
                    <tr>
                      <th class="cust-backgroud-color">`+ that.userssn + `</th>
                      <td>`+ full.userssn + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.userphone + `</th>
                      <td>`+ full.userphone + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.usersecondary_email + `</th>
                      <td>`+ full.usersecondary_email + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.userstreet1 + `</th>
                      <td>`+ full.userstreet1 + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.userstreet2 + `</th>
                      <td>`+ userstreet2 + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.city + `</th>
                      <td>`+ city + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.user_state + `</th>
                      <td>`+ full.user_state + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.userzipcode + `</th>
                      <td>`+ full.userzipcode + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.usercountry + `</th>
                      <td>`+ full.usercountry + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.userstartdate + `</th>
                      <td>`+ userstartdate + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.usersalary + `</th>
                      <td>`+ usersalary + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.costcode + `</th>
                      <td>`+ full.costcode + `</td>
                    </tr>
                    <tr>
                      <th class="cust-backgroud-color">`+ that.card_no + `</th>
                      <td>`+ full.card_no + `</td>
                    </tr>
            </table>`;
    return html;
  }
}

/**
 * Dialog created by Krunal T Tailor
 * Date 28-05-2022
 * 
 * as per task and discussion need to display error data in dialog and
 * need give skip and correct button
 * 
 * 
 */

@Component({
  selector: 'bulkupload-errordata',
  templateUrl: './bulkupload-errordata.html',
  styleUrls: ['./employee-list.component.scss']
})

export class BulkUploadErrorData {
  dtOptions: DataTables.Settings = {};
  success_buttons: boolean = false;
  failed_buttons: boolean = false;
  import_cancel_error: string;
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  constructor(
    public dialogRef: MatDialogRef<BulkUploadErrorData>, public httpCall: HttpCall, public snackbarservice: Snackbarservice,
    public uiSpinner: UiSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: any, public translate: TranslateService) {
    this.import_cancel_error = this.translate.instant('import_cancel_error');
    this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
    this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
    dialogRef.disableClose = true;
    if (data.error_data.length >= 1) {
      this.failed_buttons = true;
    } else {
      this.success_buttons = true;
    }
  }

  ngOnInit(): void {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.dtOptions = {
      pagingType: 'full_numbers',
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,
    };
  }

  saveData() {
    let that = this;
    let requestObject = {
      data: this.data.data
    };
    this.uiSpinner.spin$.next(true);
    this.httpCall.httpPostCall(httproutes.PORTAL_CHECK_AND_INSERT, requestObject).subscribe(function (params) {
      if (params.status) {
        that.uiSpinner.spin$.next(false);
        that.snackbarservice.openSnackBar(params.message, "success");
        that.dialogRef.close();
      } else {
        that.uiSpinner.spin$.next(false);
        that.snackbarservice.openSnackBar(params.message, "error");
      }
    });
  }

  cancelImport() {
    swalWithBootstrapButtons.fire({
      title: this.import_cancel_error,
      showDenyButton: false,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
    }).then((result) => {
      this.dialogRef.close();
    });
  }

}


/**
 * Dialog created by Krunal T Tailor
 * Date 28-05-2022
 * 
 * Import file button click 
 * open dialog and display instruction for download button for file
 * 
 */

@Component({
  selector: 'importbutton-download',
  templateUrl: './importbutton-download.html',
  styleUrls: ['./employee-list.component.scss']
})

export class ImportButtonDownload {
  dtOptions: DataTables.Settings = {};

  constructor(
    public dialogRef: MatDialogRef<ImportButtonDownload>,
    @Inject(MAT_DIALOG_DATA) public data: any, public translate: TranslateService) {
  }

  downloadImportTemplate() {
    this.dialogRef.close();
    return saveAs('./assets/files/user.xlsx', "user.xlsx");
  }
}

/**
 * Dialog created by Krunal T Tailor
 * Date 28-05-2022
 *
 * Team Report Component
   Team Report form
 *
 */

@Component({
  selector: 'teamreport-form',
  templateUrl: './teamreport-form.html',
  styleUrls: ['./employee-list.component.scss']
})

export class TeamReportForm {
  is_oneOnly: boolean = true;
  public form: any;
  public rolesList = [];
  selectedRoles: any;
  public statusList = configdata.superAdminStatus;
  selectedStatus: any;

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
  timecardinfo: FormGroup;
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
    public dialogRef: MatDialogRef<TeamReportForm>,
    @Inject(MAT_DIALOG_DATA) public data: any, public sb: Snackbarservice, public translate: TranslateService) {


    this.Report_File_Message = this.translate.instant('Report_File_Message');
    this.Report_File_Enter_Email = this.translate.instant('Report_File_Enter_Email');
    this.rolesList = data.allRoles;
    this.timecardinfo = this.formBuilder.group({
      All_Roles: [true],
      role_ids: [this.rolesList.map((el: any) => el.role_id)],
      All_Status: [true],
      status_ids: [this.statusList.map((el: any) => el.value)],
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
    this.timecardinfo.get("role_ids")!.valueChanges.subscribe(function (params: any) {
      if (params.length == that.rolesList.length) {
        that.timecardinfo.get("All_Roles")!.setValue(true);
      } else {
        that.timecardinfo.get("All_Roles")!.setValue(false);
      }
    });
    this.timecardinfo.get("status_ids")!.valueChanges.subscribe(function (params: any) {
      if (params.length == that.statusList.length) {
        that.timecardinfo.get("All_Status")!.setValue(true);
      } else {
        that.timecardinfo.get("All_Status")!.setValue(false);
      }
    });
  }

  onChangeValueAll_Roles(params: any) {
    if (params.checked) {
      this.timecardinfo.get("role_ids")!.setValue(this.rolesList.map((el: any) => el.role_id));
    } else {
      this.timecardinfo.get("role_ids")!.setValue([]);
    }
  }

  onChangeValueAll_Status(params: any) {
    if (params.checked) {
      this.timecardinfo.get("status_ids")!.setValue(this.statusList.map(el => el.value));
    } else {
      this.timecardinfo.get("status_ids")!.setValue([]);
    }
  }

  saveData() {
    if (this.emailsList.length != 0) {
      this.sb.openSnackBar(this.Report_File_Message, "success");
      let requestObject = this.timecardinfo.value;
      var company_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
      requestObject.email_list = this.emailsList;
      requestObject.logo_url = company_data.companydata.companylogo;

      this.httpCall.httpPostCall(httproutes.PORTAL_EMPLOYEE_REPORT, requestObject).subscribe(function (params: any) { });
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