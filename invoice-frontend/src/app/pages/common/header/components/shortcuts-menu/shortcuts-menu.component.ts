/*
 *
 * Rovuk Invoicing
 *
 * This class is the use for mainatain shortcuts. 
 * Shortcuts are use to provide quick links to the modules. 
 * Shortcuts are maintain userwise.
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/service/httpcall.service';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { Router } from '@angular/router';
import { configdata } from 'src/environments/configData';
import { Subscription } from 'rxjs/internal/Subscription';
import { ModeDetectService } from 'src/app/pages/components/map/mode-detect.service';

@Component({
  selector: 'app-shortcuts-menu',
  templateUrl: './shortcuts-menu.component.html',
  styleUrls: ['./shortcuts-menu.component.scss']
})

export class ShortcutsMenuComponent implements OnInit {
  // Variable
  public useremail: string;
  public companycode: string;
  shortcutIcon = icon.SHORTCUTLIGHT_ICON;
  selectedList: any;
  otherAppObject: any = [];
  //color_array: any = ['#536DFE', '#53abfe', '#5e53fe', '#33ccff', '#8f53fe', '#ea53fe', '#fe53a9', '#fe5353', '#ea53fe', '#fe53a9'];

  /*
    Constructor
  */
  constructor(public dialog: MatDialog, private router: Router, public httpCall: HttpCall) {
    let user_date = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.useremail = user_date.UserData.useremail;
    this.companycode = user_date.companydata.companycode;
  }

  ngOnInit(): void {
    this.getData();
  }

  /*
    Get Shortcut data api call
  */
  getData() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.SHORTCUTS_GET).subscribe(function (params) {
      if (params.status) {
        if (params.data) {
          that.selectedList = params.data.shortcusts;
        }
        that.otherAppObject = params.otherApp;
        that.otherAppObject = that.otherAppObject.filter((person: any) => person.key != configdata.SITE_TYPE);
      }
    });
  }

  openmenuadd() {
    const dialogRef = this.dialog.open(ShortcutsAddComponent, {
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getData();
    });
  }

  openpage(event: any) {
    this.router.navigate([event.url]).then();
  }

  getRandom() {
    return Math.round(Math.random() * (9 - 0) + 0);
  }
}

/*
 *
 * Rovuk Invoicing
 *
 * This class is the use for ADD/REMOVE shortcuts.
 * Shortcust needs to checked and save in popup dialog.
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

@Component({
  selector: 'add-shortcuts',
  templateUrl: './add-shortcuts.html',
  styleUrls: ['./shortcuts-menu.component.scss']
})

export class ShortcutsAddComponent implements OnInit {
  // Variable
  menuList: any = [];
  menuInfo: FormGroup;
  public usertype: any;
  public userrole: any;
  public role_permission: any;
  update_id: any;
  selectedList: any = [];
  saveIcon = icon.SAVE_WHITE;
  public backIcon: string;
  mode: any;
  subscription: Subscription;

  /*
    Constructor
  */
  constructor(private modeService: ModeDetectService, public translate: TranslateService, public snackbarservice: Snackbarservice,
    public dialogRef: MatDialogRef<ShortcutsAddComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    public httpCall: HttpCall) {
    this.menuInfo = new FormGroup({
      menu_object: new FormControl(),
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

  /*
    ngOnInit
  */

  ngOnInit(): void {
    let that = this;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.setDefaultLang(locallanguage);
    this.usertype = sessionStorage.getItem(localstorageconstants.USERTYPE) ? sessionStorage.getItem(localstorageconstants.USERTYPE) : "sponsor-portal";
    this.userrole = localStorage.getItem(localstorageconstants.USERROLE) ? localStorage.getItem(localstorageconstants.USERROLE) : 1;
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.translate.stream(["Sidebar-Dashboard", "Sidebar-TodayActivity", "Sidebar-Project", "Sidebar-Location",
      "Sidebar-Team", "Sidebar-DailyReports", "Sidebar-Setting", "Sidebar-Sponsor-Vendors", "Sidebar-Sponsor-Contract", "Sidebar-Sponsor-EmailTemplate", "Sidebar-Sponsor-ChangeOrders"]).subscribe((textarray) => {
        if (that.usertype == "sponsor-portal") {
          that.menuList = [
            {
              name: textarray['Sidebar-Dashboard'],
              icon: 'fas fa-tachometer-alt',
              image: './assets/sidemenu/dashboard_icon.png',
              url: '/dashboard',
              tmp_name: "dashboard",
              language_tmp: "Sidebar-Dashboard",
              color: "#89CFF0"
            },
            {
              name: textarray['Sidebar-TodayActivity'],
              icon: 'fas fa-stopwatch',
              image: './assets/sidemenu/todaysactivity_icon.png',
              url: '/todayactivity',
              tmp_name: "todayactivity",
              language_tmp: "Sidebar-TodayActivity",
              color: "#96DED1"
            },
            {
              name: textarray['Sidebar-DailyReports'],
              icon: 'fas fa-file-pdf',
              image: './assets/sidemenu/dailyreport_icon.png',
              url: '/report',
              tmp_name: "report",
              language_tmp: "Sidebar-DailyReports",
              color: "#2F2F4F"
            },
            {
              name: textarray['Sidebar-Location'],
              icon: 'fas fa-file-pdf',
              image: './assets/sidemenu/locationlight.png',
              url: '/location',
              tmp_name: "location",
              language_tmp: "Sidebar-Location",
              color: "#33ccff"
            },
            {
              name: textarray['Sidebar-Project'],
              icon: 'fas fa-paste',
              image: './assets/sidemenu/projects_icon.png',
              url: '/project-list',
              tmp_name: "project-list",
              language_tmp: "Sidebar-Project",
              color: "#008080"
            },
            {
              name: textarray['Sidebar-Team'],
              icon: 'fas fa-users',
              image: './assets/sidemenu/users_icon.png',
              url: '/employee-list',
              tmp_name: "employee-list",
              language_tmp: "Sidebar-Team",
              color: "#FF7377"
            },
            {
              name: textarray['Sidebar-Sponsor-ChangeOrders'],
              icon: 'fas fa-envelope',
              image: './assets/sidemenu/changeorders_icon.png',
              url: '/changeorder',
              tmp_name: "sponsorchangeorders",
              language_tmp: "Sidebar-Sponsor-ChangeOrders",
              color: "#708090"
            },
            {
              name: textarray['Sidebar-Sponsor-Vendors'],
              icon: 'fas fa-user-friends',
              image: './assets/sidemenu/vendors_icon.png',
              url: '/vendors',
              tmp_name: "sponsorvendors",
              language_tmp: "Sidebar-Sponsor-Vendors",
              color: "#DDA0DD"
            },
            {
              name: textarray['Sidebar-Sponsor-Contract'],
              icon: 'fas fa-envelope',
              image: './assets/diversityicon/darkmode/vendorsicons/vendor_note_dark.png',
              url: '/contractlisting',
              tmp_name: "sponsorcontract",
              language_tmp: "Sidebar-Sponsor-Contract",
              color: "pink"
            },
            {
              name: textarray['Sidebar-Sponsor-EmailTemplate'],
              icon: 'fas fa-envelope',
              image: './assets/sidemenu/mail_icon.png',
              url: '/emailtemplates',
              tmp_name: "sponsoremailtemplate",
              language_tmp: "Sidebar-Sponsor-EmailTemplate",
              color: "#A0522D"
            },
            {
              name: textarray['Sidebar-Setting'],
              icon: 'fas fa-cog',
              image: './assets/sidemenu/settings_icon.png',
              url: '/setting',
              tmp_name: "setting",
              language_tmp: "Sidebar-Setting",
              color: "#50A6C2"
            }
          ];

          if (that.role_permission.role_permission.settings.View == false) {
            that.menuList = that.menuList.filter((person: any) => person.tmp_name != 'setting');
          }

          if (that.role_permission.role_permission.dashboard.View == false) {
            that.menuList = that.menuList.filter((person: any) => person.tmp_name != 'dashboard');
          }

          if (that.role_permission.role_permission.todayActivity.View == false) {
            that.menuList = that.menuList.filter((person: any) => person.tmp_name != 'todayactivity');
          }

          if (that.role_permission.role_permission.dailyReports.Add == false) {
            that.menuList = that.menuList.filter((person: any) => person.tmp_name != 'report');
          }
        }
      });
    this.httpCall.httpGetCall(httproutes.SHORTCUTS_GET).subscribe(function (params) {
      if (params.status) {
        if (params.data) {
          that.update_id = params.data._id;
          that.menuInfo = new FormGroup({
            menu_object: new FormControl(params.data.shortcusts.map((el: any) => el.tmp_name)),
          });

        }

      }
    });
  }

  menu_change(event: any) {
    let that = this;
    this.selectedList = [];
    for (let m = 0; m < event.value.length; m++) {
      let obj = that.menuList.find((o: any) => o.tmp_name === event.value[m]);
      this.selectedList.push(obj);
    }
  }

  /*
    SAVE SHORTCUT BUTTON ACTION
    API call and save the shortcut for login user.
    Route: httproutes.SHORTCUTS_SAVE
    URL: /webapi/v1/portal/getshortcusts
  */

  saveData() {
    let userData = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    let reqObject: any = {
      user_id: userData.UserData._id,
      shortcusts: this.selectedList
    };
    if (this.update_id) {
      reqObject['_id'] = this.update_id;
    }
    let that = this;
    this.httpCall.httpPostCall(httproutes.SHORTCUTS_SAVE, reqObject).subscribe(function (params) {
      if (params.status) {
        that.snackbarservice.openSnackBar(params.message, "success");
        that.dialogRef.close();
        that.selectedList = params.data.shortcusts;
      } else {
        that.snackbarservice.openSnackBar(params.message, "error");
      }
    });
  }
}

