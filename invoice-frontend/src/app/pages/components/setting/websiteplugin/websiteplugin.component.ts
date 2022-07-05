import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';
import { configdata } from 'src/environments/configData';
import { Location } from '@angular/common';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpClient } from '@angular/common/http';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Subscription } from 'rxjs';
import { ModeDetectService } from '../../map/mode-detect.service';


@Component({
  selector: 'app-websiteplugin',
  templateUrl: './websiteplugin.component.html',
  styleUrls: ['./websiteplugin.component.scss']
})
export class WebsitepluginComponent implements OnInit {
  @ViewChild('inputUrl') inputUrl: any;
  emailsList: any[] = [];
  is_oneOnly: boolean = true;
  addOnBlur = true;
  removable = true;
  saveIcon: string;
  copy_url = "";
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  websiteplugin: FormGroup;
  subscription: Subscription;
  mode: any;
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;


  constructor(private loc: Location, public snackbarservice: Snackbarservice, private modeService: ModeDetectService, public uiSpinner: UiSpinnerService,
    public httpCall: HttpCall, private formBuilder: FormBuilder,) {
    let compnaydata = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).companydata;
    const angularRoute = this.loc.path();
    const url = window.location.href;

    const domainAndApp = url.replace(angularRoute, '');
    this.copy_url = "<iframe src='" + domainAndApp + "/ocpsvendor-login/" + compnaydata._id + "' style='height: 100%; width: 100%;'></iframe>";
    this.websiteplugin = this.formBuilder.group({
      regitration_url: ["", Validators.required],
    });
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    console.log("this.mode main", this.mode);
    if (this.mode == 'off') {
      console.log("this.mod", this.mode);
      this.saveIcon = icon.SAVE;


    } else {
      console.log("this.mod else", this.mode);
      this.saveIcon = icon.SAVE_WHITE;


    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.saveIcon = icon.SAVE;

      } else {
        this.mode = 'on';
        this.saveIcon = icon.SAVE_WHITE;

      }
      console.log("DARK MODE: " + this.mode);
    });


  }

  copy() {
    navigator.clipboard.writeText(this.copy_url);
  }

  ngOnInit(): void {
    this.getCompanyData();
  };

  async getCompanyData() {
    let data: any = await this.httpCall.httpGetCall(httproutes.COMPNAY_INFO_OTHER_SETTING_GET).toPromise();
    this.websiteplugin.get("regitration_url")!.setValue(data.data.vendor_registration_url);
  }

  isValidMailFormat(value: any): any {
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
  };


  internalEmailremove(email: any): void {
    let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    const index = this.emailsList.indexOf(email);
    if (index >= 0) {
      this.emailsList.splice(index, 1);
      if (email == user_data.UserData.useremail) {
        this.is_oneOnly = true;
      }
    }
  }

  addmyself() {
    if (this.is_oneOnly) {
      let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
      this.emailsList.push(user_data.UserData.useremail);
      this.is_oneOnly = false;
    }
  }

  async sendMail() {
    if (this.websiteplugin.valid) {
      let reqObject = {
        ...this.websiteplugin.value,
        emailsList: this.emailsList,
        iframecode: this.copy_url
      };

      this.uiSpinner.spin$.next(true);
      let data: any = await this.httpCall.httpPostCall(httproutes.COMPANY_SEDN_MAIL_IFRAME, reqObject).toPromise();
      if (data.status) {
        this.uiSpinner.spin$.next(false);
        this.snackbarservice.openSnackBar(data.message, "success");

      } else {
        this.uiSpinner.spin$.next(false);
        this.snackbarservice.openSnackBar(data.message, "error");
      }
    }
  }
}
