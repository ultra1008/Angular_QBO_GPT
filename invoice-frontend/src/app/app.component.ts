import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Title, Meta } from '@angular/platform-browser';
import { configdata } from 'src/environments/configData';
import { httproutes, localstorageconstants } from './consts';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { Router } from '@angular/router';
import { UiSpinnerService } from './service/spinner.service';
import { Snackbarservice } from './service/snack-bar-service';
import { HttpCall } from './service/httpcall.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import Swal from 'sweetalert2';

import { MatDialog } from '@angular/material/dialog';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false
});


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Rovuk Invoicing';
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date;
  deviceInfo: any;
  lookupInfo: any;
  dialogRef: any;


  updateIdealTimeout() {
    console.log('updateIdealTimeout');
    let that = this;

    if (localStorage.getItem('logout') == 'false')
    {
      that.httpCall.httpGetCall(httproutes.PORTAL_SETTING_GET).subscribe(function (params) {
        console.log(params)
        if (params.status)
        {
          console.log('If 1');
          if (params.data.settings.Auto_Log_Off.setting_status == "Active")
          {
            // sets an idle timeout of 1 min, for testing purposes.
            console.log('If 2');
            that.idle.setIdle(params.data.settings.Auto_Log_Off.setting_value); // Change this time from the settings
            // sets a timeout period of 10 seconds. after 10 seconds of inactivity, the user will be considered timed out.
            that.idle.setTimeout(10);
            // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
            that.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

            that.idle.onIdleEnd.subscribe(() => {
              that.idleState = 'No longer idle.'
              console.log(that.idleState);
              that.reset();
            });

            that.idle.onTimeout.subscribe(() => {
              that.mainLogout();
            });

            that.idle.onIdleStart.subscribe(() => {
              that.idleState = 'You\'ve gone idle!'
              console.log(that.idleState);
              //display diaglog here
              // that.dialogRef = that.dialog.open(TimerDialogComponent, {
              //   height: '280px',
              //   width: '600px',
              //   data: {},
              // });
              // that.dialogRef.afterClosed().subscribe(result => {
              // });

              swalWithBootstrapButtons.fire({
                title: "Your screen has been idle for a while.",
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: "Logout",
                denyButtonText: "Stay",
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed)
                {
                  that.reset();
                  that.mainLogout();
                } else if (
                  /* Read more about handling dismissals below */
                  result.dismiss === Swal.DismissReason.cancel
                )
                {
                  that.reset();
                }
              });
            });

            that.idle.onTimeoutWarning.subscribe((countdown) => {
              that.idleState = 'You will time out in ' + countdown + ' seconds!'
              console.log(that.idleState);
            });

            // sets the ping interval to 15 seconds
            that.keepalive.interval(15);

            that.keepalive.onPing.subscribe(() => that.lastPing = new Date());

            that.reset();
          }
        }
      });
    }
  }

  constructor(public dialog: MatDialog, private deviceService: DeviceDetectorService, public snackbarservice: Snackbarservice, public httpCall: HttpCall, public uiSpinner: UiSpinnerService, private router: Router, public idle: Idle, public keepalive: Keepalive, public translate: TranslateService, private metaService: Meta, private titleService: Title
  ) {
    console.log('====== Constructor call ==========');
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    var locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.deviceInfo = this.deviceService.getDeviceInfo();
    localStorage.setItem(localstorageconstants.LANGUAGE, locallanguage);
    this.translate.use(locallanguage);
    this.updateIdealTimeout();
  }

  mainLogout() {
    let that = this;
    // that.dialogRef.close();
    that.idleState = 'Timed out!';
    that.timedOut = true;
    console.log(that.idleState);
    // Ideal Timeout so Logout.
    that.uiSpinner.spin$.next(true);
    let userdata = JSON.parse(localStorage.getItem('userdata') ?? '');
    if (userdata.UserData.role_name != configdata.EMPLOYEE)
    {
      that.logoutHistory();
    } else
    {
      that.uiSpinner.spin$.next(false);
      localStorage.setItem('logout', 'true');
      that.router.navigateByUrl('/login');
    }
  }

  /*  
    Logout History -  This logs user logout action in superadmin panel
  */
  logoutHistory() {
    let that = this;
    fetch("https://ipinfo.io/json?token=a0faf8805063c2")
      .then(res => res.json())
      .then(response => {
        that.lookupInfo = response;
        let loc = that.lookupInfo['loc'];
        let let_log = loc.split(',');
        let reqObject = {
          ip_address: that.lookupInfo['ip'],
          mac_address: "",
          device_type: "Web",
          device_name: that.deviceInfo['device'] + " " + that.deviceInfo['deviceType'],
          os: that.deviceInfo['os'],
          os_version: that.deviceInfo['os_version'],
          browser: that.deviceInfo['browser'],
          browser_version: that.deviceInfo['browser_version'],
          location: that.lookupInfo['city'] + ", " + that.lookupInfo['country'] + " - " + that.lookupInfo['postal'],
          location_lat: let_log[0],
          location_lng: let_log[1]
        };
        that.httpCall.httpPostCall(httproutes.USER_LOGOUT, reqObject).subscribe(function (params) {
          if (params.status)
          {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.uiSpinner.spin$.next(false);
            localStorage.setItem('logout', 'true');
            that.router.navigateByUrl('/login');
          }
          else
          {
            that.snackbarservice.openSnackBar(params.message, 'error');
            that.uiSpinner.spin$.next(false);
          }
        });
      })
      .catch((data) => {
      });
  }

  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }

  ngOnInit() {
    this.titleService.setTitle(this.title);
    this.metaService.addTags([
      { name: 'Rovuk Invoicing', content: 'Rovuk Invoicing' },
      { name: 'a construction application', content: 'Rovuk Invoicing' },
    ]);
  }
}
