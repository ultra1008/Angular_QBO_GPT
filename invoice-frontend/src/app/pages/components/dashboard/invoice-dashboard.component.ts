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
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Label } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { httproutes, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { configdata } from 'src/environments/configData';
import { ModeDetectService } from '../map/mode-detect.service';

var chartColors = {
  red: '#f50000',
  orange: 'rgb(255, 159, 64)',
  yellow: '#dbdb06',
  green: '#07b536',
  blue: '#0735b5',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(231,233,237)'
};
@Component({
  selector: 'app-invoice-dashboard',
  templateUrl: './invoice-dashboard.component.html',
  styleUrls: ['./invoice-dashboard.component.scss']
})
export class InvoiceDashboardComponent implements OnInit {
  mode: any;
  countlist: any = {
    pending: [],
    generated: [],
    approved: [],
    rejected: [],
    late: [],
  };
  cardcountlist: any = {
    pending: [],
    process: [],
    cancelled: [],
  };;
  subscription!: Subscription;
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


  public barChartOptions: ChartOptions = {
    responsive: true,
    showLines: false,
    plugins: {
      //   legend: {
      //     display: true,
      //   },
      //   datalabels: {
      //     color: 'white',
      //     anchor: 'center',
      //     align: 'center',

      //   }
    },
    // tooltips: {
    //   callbacks: {
    //     label: function (tooltipItem, data) {
    //       let x = (parseFloat(tooltipItem.value ?? '')).toLocaleString('en-US', {
    //         style: 'currency',
    //         currency: 'USD',
    //       });
    //       return `Amount: ${x}`;
    //     }
    //   }
    // },
    scales: {
      yAxes: [{
        ticks: {
          // stepSize: 10,
          min: 0,
        },
      }],
      xAxes: [{
        ticks: {
          autoSkip: false,
          // callback: function (value, index, values) {
          //   return (value).toLocaleString('en-US', {
          //     style: 'currency',
          //     currency: 'USD',
          //   });
          // }
        }
      }],
    }
  };

  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = false;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    { data: [12, 10], label: 'Received', },
    { data: [13, 12], label: 'Processed', },
    { data: [14, 15], label: 'Cancelled', },
    { data: [15, 16], label: 'Approved invoices', },
    { data: [16, 17], label: 'Rejected invoices', },
    { data: [17, 18], label: 'Late invoices', },
    { data: [18, 19], label: 'Reports', },
  ];

  /*
    constructor
  */

  constructor(public translate: TranslateService, private modeService: ModeDetectService, public httpCall: HttpCall) {
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode)
      {
        this.mode = 'off';
      } else
      {
        this.mode = 'on';
      }
    });
  }
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
    that.getCount();
    that.getcardcount();
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
      if (params.status)
      {

        if (params.data != null)
        {
          self.list_id = params.data._id;
          self.timePeriods = params.data.chart_list;
        }
      }
    });
  }


  getCount() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_DASHBOARD_COUNT_GETDATA).subscribe(function (params) {
      if (params.status)
      {
        that.countlist = params.data;
        console.log("count", that.countlist);
      }
    });
  }

  getcardcount() {
    /* let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_DASHBOARD_CARD_COUNT_GETDATA).subscribe(function (params) {
      if (params.status) {
        that.cardcountlist = params.data;
        console.log("count", that.cardcountlist);
      }
    }); */
    this.cardcountlist = {
      pending: [1],
      process: [1, 2],
      cancelled: [1, 2, 3],
    };
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
