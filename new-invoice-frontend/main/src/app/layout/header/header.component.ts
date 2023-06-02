import { RightSidebarService } from 'src/app/core/service/rightsidebar.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { DOCUMENT } from '@angular/common';
import { Component, Inject, ElementRef, OnInit, Renderer2, AfterViewInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from 'src/app/config/config.service';
import { InConfiguration } from 'src/app/core/models/config.interface';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { TranslateService } from '@ngx-translate/core';
import { configData } from 'src/environments/configData';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { MatDialog } from '@angular/material/dialog';
import { Direction } from '@angular/cdk/bidi';
import { SwitchCompanyComponent } from './switch-company/switch-company.component';
import { WEB_ROUTES } from 'src/consts/routes';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { MatMenuTrigger } from '@angular/material/menu';
import { Observable, map, startWith } from 'rxjs';
import { Invoice } from 'src/app/invoice/invoice.model';

interface Notifications {
  message: string;
  time: string;
  icon: string;
  color: string;
  status: string;
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends UnsubscribeOnDestroyAdapter implements OnInit, AfterViewInit {
  public config!: InConfiguration;
  isNavbarCollapsed = true;
  isOpenSidebar?: boolean;
  docElement: HTMLElement | undefined;
  isFullScreen = false;
  isDarTheme = false;
  toggleControl = new FormControl(false);
  darkIcon?: string;
  userName?: string;
  userPicture?: string;
  unseenCount = 0;

  companyList: any = [];
  isLoading = true;
  constructor (@Inject(DOCUMENT) private document: Document, private renderer: Renderer2, public elementRef: ElementRef,
    private rightSidebarService: RightSidebarService, private configService: ConfigService, private authService: AuthService,
    private router: Router, public translate: TranslateService, public dialog: MatDialog, private commonService: CommonService,) {
    super();
  }
  notifications: Notifications[] = [
    {
      message: 'Please check your mail',
      time: '14 mins ago',
      icon: 'mail',
      color: 'nfc-green',
      status: 'msg-unread',
    },
    {
      message: 'New Patient Added..',
      time: '22 mins ago',
      icon: 'person_add',
      color: 'nfc-blue',
      status: 'msg-read',
    },
    {
      message: 'Your leave is approved!! ',
      time: '3 hours ago',
      icon: 'event_available',
      color: 'nfc-orange',
      status: 'msg-read',
    },
    {
      message: 'Lets break for lunch...',
      time: '5 hours ago',
      icon: 'lunch_dining',
      color: 'nfc-blue',
      status: 'msg-read',
    },
    {
      message: 'Patient report generated',
      time: '14 mins ago',
      icon: 'description',
      color: 'nfc-green',
      status: 'msg-read',
    },
    {
      message: 'Please check your mail',
      time: '22 mins ago',
      icon: 'mail',
      color: 'nfc-red',
      status: 'msg-read',
    },
    {
      message: 'Salary credited...',
      time: '3 hours ago',
      icon: 'paid',
      color: 'nfc-purple',
      status: 'msg-read',
    },
  ];
  myControl = new UntypedFormControl();
  invoiceList: Array<Invoice> = [];
  invoiceLoader = true;

  async ngOnInit() {
    this.config = this.configService.configData;
    const user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.userName = user_data.UserData.userfullname;
    this.userPicture = user_data.UserData.userpicture;
    const requestObject = {
      useremail: user_data.UserData.useremail
    };
    const data = await this.commonService.postRequestAPI(httpversion.V1 + httproutes.GET_MY_COMPANY_LIST, requestObject);
    this.isLoading = false;
    if (data.status) {
      this.companyList = data.data;
    }

    let tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    tmp_locallanguage = tmp_locallanguage == '' || tmp_locallanguage == undefined || tmp_locallanguage == null ? configData.INITIALLANGUAGE : tmp_locallanguage;
    this.translate.use(tmp_locallanguage);
    this.translate.stream(['']).subscribe((textarray) => { });
    this.getNotificationCount();
  }

  async getNotificationCount() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_INVOICE_MESSAGE_COUNT);
    if (data.status) {
      this.unseenCount = data.unseen;
    }
  }

  ngAfterViewInit() {
    // set theme on startup
    if (localStorage.getItem(localstorageconstants.DARKMODE)) {
      if (localStorage.getItem(localstorageconstants.DARKMODE) === 'dark') {
        this.isDarTheme = true;
        this.darkIcon = 'moon';
      } else if (localStorage.getItem(localstorageconstants.DARKMODE) === 'light') {
        this.isDarTheme = false;
        this.darkIcon = 'sun';
      } else {
        this.isDarTheme = this.config.layout.variant === 'dark' ? true : false;
        if (this.isDarTheme) {
          this.darkIcon = 'moon';
        } else {
          this.darkIcon = 'sun';
        }
      }
    } else {
      this.isDarTheme = this.config.layout.variant === 'dark' ? true : false;
      if (this.isDarTheme) {
        this.darkIcon = 'moon';
      } else {
        this.darkIcon = 'sun';
      }
    }

    // if (
    //   window.matchMedia &&
    //   window.matchMedia('(prefers-color-scheme: dark)').matches
    // ) {
    //   // dark mode
    //   console.log('dark mode');
    //   this.isDarTheme = true;
    //   this.darkIcon = 'moon';
    // } else {
    //   //Light mode
    //   console.log('Light mode');
    //   this.isDarTheme = false;
    //   this.darkIcon = 'sun';
    // }

    if (localStorage.getItem(localstorageconstants.DARKMODE)) {
      this.renderer.removeClass(this.document.body, this.config.layout.variant);
      this.renderer.addClass(
        this.document.body,
        localStorage.getItem(localstorageconstants.DARKMODE) as string
      );
    } else {
      this.renderer.addClass(this.document.body, this.config.layout.variant);
    }

    if (localStorage.getItem('menuOption')) {
      this.renderer.addClass(
        this.document.body,
        localStorage.getItem('menuOption') as string
      );
    } else {
      this.renderer.addClass(
        this.document.body,
        'menu_' + this.config.layout.sidebar.backgroundColor
      );
    }

    if (localStorage.getItem('choose_logoheader')) {
      this.renderer.addClass(
        this.document.body,
        localStorage.getItem('choose_logoheader') as string
      );
    } else {
      this.renderer.addClass(
        this.document.body,
        'logo-' + this.config.layout.logo_bg_color
      );
    }

    if (localStorage.getItem('sidebar_status')) {
      if (localStorage.getItem('sidebar_status') === 'close') {
        this.renderer.addClass(this.document.body, 'side-closed');
        this.renderer.addClass(this.document.body, 'submenu-closed');
      } else {
        this.renderer.removeClass(this.document.body, 'side-closed');
        this.renderer.removeClass(this.document.body, 'submenu-closed');
      }
    } else {
      if (this.config.layout.sidebar.collapsed === true) {
        this.renderer.addClass(this.document.body, 'side-closed');
        this.renderer.addClass(this.document.body, 'submenu-closed');
      }
    }

    this.toggleControl.valueChanges.subscribe((darkMode) => {
      console.log(darkMode);
      if (darkMode) {
        // dark mode
        this.darkThemeBtnClick();
      } else {
        // light mode
        this.lightThemeBtnClick();
      }
    });
  }

  goChangePassword() {
    this.router.navigate(['/authentication/change-password']);
  }

  gotoSettings() {
    this.router.navigate(['/settings']);
  }

  languageSwitcher() {
    console.log('Language switcher call');
  }

  callFullscreen() {
    if (!this.isFullScreen) {
      this.docElement?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    this.isFullScreen = !this.isFullScreen;
  }
  mobileMenuSidebarOpen(event: Event, className: string) {
    const hasClass = (event.target as HTMLInputElement).classList.contains(
      className
    );
    if (hasClass) {
      this.renderer.removeClass(this.document.body, className);
    } else {
      this.renderer.addClass(this.document.body, className);
    }
  }
  callSidemenuCollapse() {
    const hasClass = this.document.body.classList.contains('side-closed');
    if (hasClass) {
      this.renderer.removeClass(this.document.body, 'side-closed');
      this.renderer.removeClass(this.document.body, 'submenu-closed');
    } else {
      this.renderer.addClass(this.document.body, 'side-closed');
      this.renderer.addClass(this.document.body, 'submenu-closed');
    }
  }
  logout() {
    this.authService.logout().subscribe((res) => {
      if (!res.success) {
        localStorage.removeItem(localstorageconstants.DARKMODE);
        localStorage.removeItem(localstorageconstants.USERDATA);
        localStorage.removeItem(localstorageconstants.COMPANYDATA);
        localStorage.removeItem(localstorageconstants.COMPANYID);
        localStorage.removeItem(localstorageconstants.INVOICE_GIF);
        localStorage.removeItem(localstorageconstants.INVOICE_TOKEN);
        localStorage.setItem(localstorageconstants.LOGOUT, 'true');
        localStorage.removeItem('choose_logoheader');
        localStorage.removeItem('choose_skin');
        localStorage.removeItem('menuOption');
        localStorage.removeItem('thinvoicetheme');
        this.router.navigate(['/authentication/signin']);
      }
    });
  }

  lightThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'dark');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_dark');
    this.renderer.removeClass(this.document.body, 'logo-black');
    if (localStorage.getItem('choose_skin')) {
      this.renderer.removeClass(
        this.document.body,
        localStorage.getItem('choose_skin') as string
      );
    } else {
      this.renderer.removeClass(
        this.document.body,
        'theme-' + this.config.layout.theme_color
      );
    }

    this.renderer.addClass(this.document.body, 'light');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_light');
    this.renderer.addClass(this.document.body, 'logo-white');
    this.renderer.addClass(this.document.body, 'theme-white');
    const theme = 'light';
    const menuOption = 'menu_light';
    // this.selectedBgColor = 'white';
    // this.isDarkSidebar = false;
    localStorage.setItem('choose_logoheader', 'logo-white');
    localStorage.setItem('choose_skin', 'theme-white');
    localStorage.setItem(localstorageconstants.DARKMODE, theme);
    localStorage.setItem('menuOption', menuOption);
  }
  darkThemeBtnClick() {
    this.renderer.removeClass(this.document.body, 'light');
    this.renderer.removeClass(this.document.body, 'submenu-closed');
    this.renderer.removeClass(this.document.body, 'menu_light');
    this.renderer.removeClass(this.document.body, 'logo-white');
    if (localStorage.getItem('choose_skin')) {
      this.renderer.removeClass(
        this.document.body,
        localStorage.getItem('choose_skin') as string
      );
    } else {
      this.renderer.removeClass(
        this.document.body,
        'theme-' + this.config.layout.theme_color
      );
    }
    this.renderer.addClass(this.document.body, 'dark');
    this.renderer.addClass(this.document.body, 'submenu-closed');
    this.renderer.addClass(this.document.body, 'menu_dark');
    this.renderer.addClass(this.document.body, 'logo-black');
    this.renderer.addClass(this.document.body, 'theme-black');
    const theme = 'dark';
    const menuOption = 'menu_dark';
    // this.selectedBgColor = 'black';
    // this.isDarkSidebar = true;
    localStorage.setItem('choose_logoheader', 'logo-black');
    localStorage.setItem('choose_skin', 'theme-black');
    localStorage.setItem(localstorageconstants.DARKMODE, theme);
    localStorage.setItem('menuOption', menuOption);
  }

  switchCompany() {
    let tempDirection: Direction;

    if (localStorage.getItem('isRtl') === 'true') {
      tempDirection = 'rtl';
    } else {
      tempDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(SwitchCompanyComponent, {
      width: '28%',
      data: {
        /* advanceTable: this.advanceTable,
        action: 'add', */
      },
      direction: tempDirection,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result: any) => {
      //  
    });
  }
  goUserProfile() {
    const user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.router.navigate([WEB_ROUTES.USER_FORM], {
      queryParams: { _id: user_data.UserData._id },
    });
  }

  viewMessage() {
    this.router.navigate([WEB_ROUTES.INVOICE_MESSAGES]);
  }

  async onSearch() {
    if (this.myControl.value) {
      this.invoiceLoader = true;
      const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_HEADER_INVOICE_SERACH, { search: this.myControl.value });
      if (data.status) {
        this.invoiceList = data.data;
        this.invoiceLoader = false;
        console.log("data: ", data);
      }
    } else {
      this.invoiceLoader = false;
    }
  }

  openInvoiceDetail(invoice: Invoice) {
    this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { _id: invoice._id } });
  }
}
