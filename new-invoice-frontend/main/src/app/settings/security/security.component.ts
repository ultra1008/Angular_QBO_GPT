import { Component } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/services/httpcall.service';
import { httpversion, httproutes } from 'src/consts/httproutes';
import { swalWithBootstrapButtons, showNotification } from 'src/consts/utils';
import { SettingsService } from '../settings.service';
import { configData } from 'src/environments/configData';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss'],
})
export class SecurityComponent {
  timerOptions = configData.TIMEROPTIONS;
  otpOptions = configData.OTPOPTIONS;
  settingObject: any;
  setting_id!: string;
  otpSwitch: boolean = false;
  timeoutSwitch: boolean = false;
  Project_Settings_Alert_Sure_Want_Change: string = '';
  Compnay_Equipment_Delete_Yes: string = '';
  Compnay_Equipment_Delete_No: string = '';
  timer: string = '';
  tempTimer: string = '';
  tempTimerSwitch: string = '';
  otp = 'Yes';
  tempOtpSwitch: string = '';

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public httpCall: HttpCall,
    private snackBar: MatSnackBar,
    public SettingsServices: SettingsService,
    public translate: TranslateService,
    public myapp: AppComponent
  ) {}

  ngOnInit(): void {
    let that = this;
    this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_SETTING_GET)
      .subscribe(function (params) {
        console.log(params);
        if (params.status) {
          if (params.data) {
            that.settingObject = params.data.settings;
            that.setting_id = params.data._id;
            if (params.data.settings.Auto_Log_Off.setting_status == 'Active') {
              that.timeoutSwitch = true;
            } else {
              that.timeoutSwitch = false;
            }
            console.log(that.timeoutSwitch);
            if (params.data.settings.Enable_OTP.setting_status == 'Active') {
              that.otpSwitch = true;
            } else {
              that.otpSwitch = false;
            }
            that.timer =
              params.data.settings.Auto_Log_Off.setting_value.toString();
            that.tempTimer =
              params.data.settings.Auto_Log_Off.setting_value.toString();
            that.otp = params.data.settings.Enable_OTP.setting_value.toString();
            that.tempTimerSwitch =
              params.data.settings.Auto_Log_Off.setting_status.toString();
            that.tempOtpSwitch =
              params.data.settings.Enable_OTP.setting_status.toString();
          }
        }
      });
  }

  modelSwitchChangeTimeOut(event: any) {
    console.log(event);
    let settingKey = 'settings.' + 'Auto_Log_Off';
    let obj = this.settingObject['Auto_Log_Off'];
    obj.setting_status = event ? 'Active' : 'Inactive';
    let reqObject = {
      [settingKey]: obj,
    };
    console.log(reqObject);
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Project_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.timeoutSwitch = event;
          that.updateSetting(reqObject);
        } else {
          if (that.tempTimerSwitch == 'Active') {
            that.timeoutSwitch = true;
          } else {
            that.timeoutSwitch = false;
          }
        }
      });
  }

  modelChangeTimeout(event: any) {
    console.log(event);
    // this.timer = event;
    let settingKey = 'settings.' + 'Auto_Log_Off';
    let obj = this.settingObject['Auto_Log_Off'];
    obj.setting_value = event;
    let reqObject = {
      [settingKey]: obj,
    };
    console.log(reqObject);
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Project_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.timer = event;
          that.updateSetting(reqObject);
        } else {
          console.log(this.timer);
          that.timer = that.tempTimer;
        }
      });
  }

  updateSetting(objectForEdit: any) {
    let that = this;
    objectForEdit._id = that.setting_id;
    this.httpCall
      .httpPostCall(
        httpversion.PORTAL_V1 + httproutes.PORTAL_SETTING_UPDATE,
        objectForEdit
      )
      .subscribe(function (data) {
        if (data.status) {
          showNotification(this.snackBar, data.message, 'success');
          // that.myapp.updateIdealTimeout();
        } else {
          showNotification(this.snackBar, data.message, 'error');
        }
      });
  }

  modelChangeOtp(event: any) {
    console.log(event);
    // this.timer = event;
    let settingKey = 'settings.' + 'Enable_OTP';
    let obj = this.settingObject['Enable_OTP'];
    obj.setting_value = event;
    let reqObject = {
      [settingKey]: obj,
    };
    console.log(reqObject);
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Project_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.otp = event;
          that.updateSetting(reqObject);
        } else {
          console.log(this.timer);
          that.otp = that.tempOtpSwitch;
        }
      });
  }

  modelSwitchChangeOtp(event: any) {
    console.log(event);
    let settingKey = 'settings.' + 'Enable_OTP';
    let obj = this.settingObject['Enable_OTP'];
    obj.setting_status = event ? 'Active' : 'Inactive';
    let reqObject = {
      [settingKey]: obj,
    };
    console.log(reqObject);
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.Project_Settings_Alert_Sure_Want_Change,
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.Compnay_Equipment_Delete_Yes,
        denyButtonText: this.Compnay_Equipment_Delete_No,
      })
      .then((result) => {
        if (result.isConfirmed) {
          that.otpSwitch = event;
          that.updateSetting(reqObject);
        } else {
          if (that.tempOtpSwitch == 'Active') {
            that.otpSwitch = true;
          } else {
            that.otpSwitch = false;
          }
        }
      });
  }

  back() {
    this.router.navigate(['/settings']);
  }
}
