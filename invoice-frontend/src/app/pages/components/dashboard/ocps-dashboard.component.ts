/*
 *
 * Rovuk Invoicing
 *
 * This component is used for Display all 8 charts on dashboard in 3 x 3 grid
 *
 * Created by Rovuk.
 * Copyright © 2022 Rovuk. All rights reserved.
 *
 */

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { httproutes, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { configdata } from 'src/environments/configData';

@Component({
  selector: 'app-ocps-dashboard',
  templateUrl: './ocps-dashboard.component.html',
  styleUrls: ['./ocps-dashboard.component.scss']
})
export class OcpsDashboardComponent implements OnInit {
  timePeriods: any = [
    "app-totalprojectvalue",
    // "app-minority-participations", // We commented this as per requirement
    "app-totalnumber-discipline",
    "app-dailyreport-by-status",
    "app-contractvalue-by-prime",
    "app-totalvalueby-minority",
    "app-totalminority-contract",
    "app-totalContractvalueMinority",
    "app-paymentperproject"
  ];

  /*
    constructor
  */

  constructor(public translate: TranslateService, public httpCall: HttpCall) { }
  locallanguage: any;
  hideShow: boolean = true;
  local_user: any;
  list_id: any;

  /*
   ngOnInit
  */

  ngOnInit(): void {
    let that = this;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    that.translate.use(this.locallanguage);

    this.local_user = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!).UserData;

    this.translate.stream(['']).subscribe((textarray) => {
      this.refreshPage();
    });
    this.getChartList();
  }

  refreshPage() {
    this.hideShow = false;
    let that = this;
    setTimeout(() => {
      that.hideShow = true;
    }, 1000);
  }

  drop(event: CdkDragDrop<string[]>) {
    let tmp = moveItemInArray(this.timePeriods, event.previousIndex, event.currentIndex);
    this.saveChartList(this.timePeriods);
  }

  // Get user saved order for chart list
  getChartList() {
    let self = this;
    this.httpCall.httpPostCall(httproutes.GET_CHART_LIST, { user_id: this.local_user._id }).subscribe(params => {
      if (params.status) {

        if (params.data != null) {
          self.list_id = params.data._id;
          self.timePeriods = params.data.chart_list;
        }
      }
    });
  }

  // Save chart order list for Dashboard
  saveChartList(timePeriods: any) {
    let self = this;
    let reqObject = {
      _id: self.list_id,
      chart_list: timePeriods,
      user_id: this.local_user._id
    };
    this.httpCall.httpPostCall(httproutes.SAVE_CHART_LIST, reqObject).subscribe(params => {

    });
  }
}
