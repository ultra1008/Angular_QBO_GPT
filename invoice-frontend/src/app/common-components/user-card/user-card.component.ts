/*
 *
 * Rovuk Invoicing
 *
 * This is the component which is used for display User profile
 * User card contains info like User Profile picture, User First name and Last name,
 * User Email, User Phone and User Job Title
 * 
 * User card shows user status Active/Inactive
 * 
 * On User card user can get Edit and Delete user action
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { HttpCall } from './../../service/httpcall.service';
import { Snackbarservice } from './../../service/snack-bar-service';
import { Mostusedservice } from './../../service/mostused.service';
import { formatPhoneNumber } from "./../../service/utils";
import { httproutes, icon } from './../../consts';
import { Subscription } from 'rxjs';
import { ModeDetectService } from 'src/app/pages/components/map/mode-detect.service';
import { localstorageconstants } from 'src/app/consts/localstorageconstants';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  allowOutsideClick: false,
  buttonsStyling: false
});

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.scss']
})

export class UserCardComponent implements OnInit {
  @Input() UserData: any;
  @Input() deleteTeamMember: any;
  User_Card_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  acticve_word: string = "";
  inacticve_word: string = "";
  trashIcon: string;
  editIcon: string;
  mode: any;
  subscription: Subscription;
  userComplianceIcon = icon.USER_COMPLIANCE_ICON;

  role_permission: any;

  /*
    Constructor
  */
  constructor(private modeService: ModeDetectService, public translate: TranslateService, public mostusedservice: Mostusedservice,
    public httpCall: HttpCall, public snackbarservice: Snackbarservice, public router: Router) {
    var userdata = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.role_permission = userdata.role_permission.users;
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.trashIcon = "./assets/diversityicon/thememode/trash_icon.png";
      this.editIcon = "./assets/diversityicon/thememode/edit_icon.png";
    } else {
      this.trashIcon = "./assets/diversityicon/darkmode/trash_icon_dark.png";
      this.editIcon = "./assets/diversityicon/darkmode/edit_icon_dark.png";
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.trashIcon = "./assets/diversityicon/thememode/trash_icon.png";
        this.editIcon = "./assets/diversityicon/thememode/edit_icon.png";
      } else {
        this.mode = 'on';
        this.trashIcon = "./assets/diversityicon/darkmode/trash_icon_dark.png";
        this.editIcon = "./assets/diversityicon/darkmode/edit_icon_dark.png";
      }
    });
    this.translate.stream(['']).subscribe((textarray) => {
      this.User_Card_Do_Want_Delete = this.translate.instant('User_Card_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
      this.acticve_word = this.translate.instant('Team-EmployeeList-Status-Active');
      this.inacticve_word = this.translate.instant('project_setting_inactive');
    });
  }

  ngOnInit(): void { }

  /*
    View Employee Profile
  */
  viewEmployeePage(id: any) {
    this.router.navigateByUrl('/employee-view/' + id);
  }

  phonenoFormat(data: any) {
    return formatPhoneNumber(data);
  }

  /*
    Delete Employee Action - Before delete any user this confirmation dialog asked.
  */

  deleteEmployeeAction() {
    let that = this;
    if (that.role_permission.Delete) {
      swalWithBootstrapButtons.fire({
        title: this.User_Card_Do_Want_Delete,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      }).then((result) => {
        if (result.isConfirmed) {
          this.httpCall.httpPostCall(httproutes.TEAM_DELETE, this.UserData).subscribe(function (params) {
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
}
