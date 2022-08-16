import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { LanguageApp } from 'src/app/service/utils';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { ModeDetectService } from '../map/mode-detect.service';
import { EmployeeService } from '../team/employee.service';
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
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
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
  subscription!: Subscription;
  historyIcon!: string;
  trashIcon!: string;
  importIcon!: string;
  editIcon!: string;
  reportIcon!: string;
  role_to: any;
  allRoles = [];

  role_permission: any;

  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild('OpenFilebox') OpenFilebox: any;
  Company_Equipment_File_Not_Match: any;
  constructor(private modeService: ModeDetectService, private router: Router, public mostusedservice: Mostusedservice,
    public employeeservice: EmployeeService, public translate: TranslateService, public dialog: MatDialog,
    public httpCall: HttpCall, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService) {
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
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '');
    console.log("role", role_permission.UserData.role_name);
    this.role_to = role_permission.UserData.role_name;
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



  ngAfterViewInit() {
    this.dtTrigger.next();
  }


  getAllRoles() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_ROLES_ALL).subscribe(function (params) {
      if (params.status) {
        that.allRoles = params.data;
      }
    });
  }



  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
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



}
