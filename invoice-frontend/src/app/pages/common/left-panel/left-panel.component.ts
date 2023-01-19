/*
 *
 * RRovuk Invoicing
 *
 * This class is the Left side menu. 
 * User can access side memu Dashboard, Today's Activity, Daily Reports, Project,
 * Users, Change Orders, Vendors, Contracts, Email templates, Settings
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

import { Component, OnInit, Input, HostListener } from '@angular/core';
import { LayoutService } from '../../../shared/services/layout.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { localstorageconstants, routes } from 'src/app/consts';
import { configdata } from 'src/environments/configData';

@Component({
  selector: 'app-left-panel',
  templateUrl: './left-panel.component.html',
  styleUrls: ['./left-panel.component.scss']
})

export class LeftPanelComponent implements OnInit {
  asidebarHeight: any;
  @Input() navLayout: any;
  @Input() defaultNavbar: any;
  @Input() toggleNavbar: any;
  @Input() toggleStatus: any;
  @Input() navbarEffect: any;
  @Input() deviceType: any;
  @Input() headerColorTheme: any;
  @Input() navbarColorTheme: any;
  @Input() activeNavColorTheme: any;
  title: any;
  menuList: any;
  selected: any;
  public usertype: any;
  public userrole: any;
  public role_permission: any;
  public publicrroute: any;
  text_menu_array: any = [];
  public routers: typeof routes = routes;
  company_logo: any = "../assets/images/placeholder_logo.png";
  company_code: any = "";

  /*
    Constructor
  */
  constructor(private layoutService: LayoutService, private router: Router,
    public mostusedservice: Mostusedservice, public route: ActivatedRoute, public translate: TranslateService) {

    var tmpurl = this.router.url.split("?");
    this.publicrroute = tmpurl[0];
    let that = this;
    if (this.route.snapshot.paramMap.get('idparms') != null) {
      let newtmp_url = tmpurl[0].split("/");
      this.publicrroute = newtmp_url[1];
    }
    translate.addLangs(configdata.sitelanguages);
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    translate.setDefaultLang(locallanguage);
    this.usertype = sessionStorage.getItem(localstorageconstants.USERTYPE) ? sessionStorage.getItem(localstorageconstants.USERTYPE) : "portal";
    this.userrole = localStorage.getItem(localstorageconstants.USERROLE) ? localStorage.getItem(localstorageconstants.USERROLE) : 1;

    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);

    if (this.usertype == "invoice-portal") {
      this.company_code = this.role_permission.companydata.companycode;
      this.company_logo = this.role_permission.companydata.companylogo;
    }

    this.translate.stream(['Sidebar-Dashboard', 'Sidebar-Vendors', 'Sidebar-invoice', 'Sidebar-Templates', 'Sidebar-Report', 'Sidebar-Team', "Sidebar-Setting"]).subscribe((textarray) => {

      that.menuList = [];
      /* that.menuList = [
        {
          name: textarray['Sidebar-Project'],
          icon: '',
          image: './assets/sidemenu/projects_icon.png',
          url: '/project-list',
        },
        {
          name: textarray['Sidebar-Team'],
          name_tmp: "Team",
          icon: '',
          image: './assets/sidemenu/users_icon.png',
          url: '/employee-list',
        },
        {
          name: textarray['Sidebar-Sponsor-ChangeOrders'],
          icon: '',
          image: './assets/sidemenu/changeorders_icon.png',
          url: '/changeorder',
        },
        {
          name: textarray['Sidebar-Sponsor-Vendors'],
          icon: '',
          image: './assets/sidemenu/vendors_icon.png',
          url: '/vendors',
        },
        {
          name: textarray['Sidebar-Sponsor-Contract'],
          icon: '',
          image: './assets/diversityicon/darkmode/vendorsicons/vendor_note_dark.png',
          url: '/contractlisting',
        },
        {
          name: textarray['Sidebar-Sponsor-EmailTemplate'],
          icon: '',
          image: './assets/sidemenu/mail_icon.png',
          url: '/emailtemplates',
        },
      ]; */

      let index = 0;
      // Dashboard Menu
      // if (that.role_permission.role_permission.dashboard.View == true) {
      if (true) {
        let reqObj = {
          name: textarray['Sidebar-Dashboard'],
          icon: '',
          image: './assets/sidemenu/dashboard_icon.png',
          url: '/dashboard',
        };
        that.menuList.splice(index++, 0, reqObj);
      }
      // vendors
      if (true) {
        let reqObj = {
          name: textarray['Sidebar-Vendors'],
          icon: '',
          image: './assets/diversityicon/vendors_icon.png',
          url: '/vendors',
        };
        that.menuList.splice(index++, 0, reqObj);
      }

      // Today Activity Menu
      // if (that.role_permission.role_permission.todayActivity.View == true) {
      if (true) {
        let reqObj = {
          name: textarray['Sidebar-invoice'],
          icon: '',
          image: './assets/sidemenu/dailyreport_icon.png',
          url: '/invoice',
        };
        that.menuList.splice(index++, 0, reqObj);
      }

      // Daily Report Menu
      // if (that.role_permission.role_permission.dailyReports.View == true) {
      if (true) {
        let reqObj = {
          name: textarray['Sidebar-Templates'],
          icon: '',
          image: './assets/diversityicon/template_white.png',
          url: '/template',
        };
        that.menuList.splice(index++, 0, reqObj);
      }

      // Location
      // if (that.role_permission.role_permission.dailyReports.View == true) {
      if (true) {
        let reqObj = {
          name: textarray['Sidebar-Report'],
          icon: '',
          image: './assets/diversityicon/reports_white.png',
          url: '/reports',
        };
        that.menuList.splice(index++, 0, reqObj);
      }

      // Project Menu
      // if (that.role_permission.role_permission.projects.View == true) {
      //   let reqObj = {
      //     name: textarray['Sidebar-Project'],
      //     icon: '',
      //     image: './assets/sidemenu/projects_icon.png',
      //     url: '/project-list',
      //   };
      //   that.menuList.splice(index++, 0, reqObj);
      // }

      // User Menu
      // if (that.role_permission.role_permission.users.View == true) {
      if (true) {
        let reqObj = {
          name: textarray['Sidebar-Team'],
          icon: '',
          image: './assets/sidemenu/users_icon.png',
          url: '/employee-list',
        };
        that.menuList.splice(index++, 0, reqObj);
      }

      // Change Order Menu
      // if (that.role_permission.role_permission.changeOrders.View == true) {
      //   let reqObj = {
      //     name: textarray['Sidebar-Sponsor-ChangeOrders'],
      //     icon: '',
      //     image: './assets/sidemenu/changeorders_icon.png',
      //     url: '/changeorder',
      //   };
      //   that.menuList.splice(index++, 0, reqObj);
      // }

      // Vendor Menu
      // if (that.role_permission.role_permission.vendors.View == true) {
      //   let reqObj = {
      //     name: textarray['Sidebar-Sponsor-Vendors'],
      //     icon: '',
      //     image: './assets/sidemenu/vendors_icon.png',
      //     url: '/vendors',
      //   };
      //   that.menuList.splice(index++, 0, reqObj);
      // }

      // Contract Menu
      // if (that.role_permission.role_permission.vendors.View == true) {
      // let reqObj = {
      //   name: textarray['Sidebar-Sponsor-Contract'],
      //   icon: '',
      //   image: './assets/diversityicon/darkmode/vendorsicons/vendor_note_dark.png',
      //   url: '/contractlisting',
      // };
      // that.menuList.splice(index++, 0, reqObj);
      // }

      // Email Template Menu
      // if (that.role_permission.role_permission.emailTemplates.View == true) {
      //   let reqObj = {
      //     name: textarray['Sidebar-Sponsor-EmailTemplate'],
      //     icon: '',
      //     image: './assets/sidemenu/mail_icon.png',
      //     url: '/emailtemplates',
      //   };
      //   that.menuList.splice(index++, 0, reqObj);
      // }

      // Setting Menu
      // if (that.role_permission.role_permission.settings.View == true) {
      if (true) {
        let reqObj = {
          name: textarray['Sidebar-Setting'],
          icon: '',
          image: './assets/sidemenu/settings_icon.png',
          url: '/setting',
        };
        that.menuList.splice(index, 0, reqObj);
      }
    });
  }

  isActive(item: any) {
    return this.selected === item;
  }

  onItemSelect(item: any) {
    this.selected = (this.selected === item ? item : item);
  }

  onSubItemSelect(item: any) {
    //event.stopPropagation();
    this.selected = (this.selected === item ? item : item);
  }

  moveToSettings() {
    this.router.navigate([this.routers.SETTING]).then();
  }

  checkMenuActive(value: any) {
    var tmpurl = this.router.url.split("?");
    this.publicrroute = tmpurl[0];

    if (this.route.snapshot.paramMap.get('idparms') != null) {
      let newtmp_url = tmpurl[0].split("/");
      this.publicrroute = newtmp_url[1];

    }
    if (value.url == "/superadmin/company" && this.publicrroute == "/superadmin/companyform") {
      return true;
    }
    if (value.url == "/superadmin/safetytalks" && this.publicrroute == "/superadmin/safetytalks-form") {
      return true;
    }
    if (value.url == "/superadmin/safetytalks" && this.publicrroute == "/superadmin/checklist-form") {
      return true;
    }
    if (value.url == "/location" && this.publicrroute == "/location-form") {
      return true;
    }
    return false;
  }

  @HostListener('window:resize', ['$event'])
  onResizeHeight(event: any) {
    this.asidebarHeight = window.innerHeight;
  }

  ngOnInit() {
    this.layoutService.setAsidebarHeightCast.subscribe(setSidebarHeight => this.asidebarHeight = setSidebarHeight);
    let self = this;
    var company_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);

    this.company_logo = company_data.companydata.companylogo;
    this.title = 'Navigation';
    this.mostusedservice.updatecompnayUserEmit$.subscribe(function (params: any) {
      var company_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
      self.company_logo = company_data.companydata.companylogo;
    });
  }
}
