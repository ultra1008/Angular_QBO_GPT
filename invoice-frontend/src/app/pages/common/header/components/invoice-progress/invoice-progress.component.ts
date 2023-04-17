import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { icon, localstorageconstants } from 'src/app/consts';
import { ModeDetectService } from 'src/app/pages/components/map/mode-detect.service';
import { HttpCall } from 'src/app/service/httpcall.service';




@Component({
  selector: 'app-invoice-progress',
  templateUrl: './invoice-progress.component.html',
  styleUrls: ['./invoice-progress.component.scss']
})
export class InvoiceProgressComponent implements OnInit {
  @ViewChild("menuTrigger") trigger: MatMenuTrigger;

  public useremail: string;
  public companycode: string;
  notificationIcon = icon.HISTORY_WHITE;
  selectedList: any;
  otherAppObject: any = [];
  //color_array: any = ['#536DFE', '#53abfe', '#5e53fe', '#33ccff', '#8f53fe', '#ea53fe', '#fe53a9', '#fe5353', '#ea53fe', '#fe53a9'];

  start: number = 0;
  is_httpCall: boolean = false;
  progressList = [
    {
      total: 3,
      final: 2,
      ratio: 0.67,
    },
    {
      total: 5,
      final: 2,
      ratio: 0.2,
    },
    {
      total: 4,
      final: 2,
      ratio: 0.5,
    },
    {
      total: 4,
      final: 4,
      ratio: 1,
    }
  ];
  unseen_count: number = 0;

  mode: any;
  subscription: Subscription;

  showAllNotification: Boolean = true;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    public httpCall: HttpCall,
    private modeService: ModeDetectService
  ) {
    let user_date = JSON.parse(
      localStorage.getItem(localstorageconstants.USERDATA)
    );
    this.useremail = user_date.UserData.useremail;
    this.companycode = user_date.companydata.companycode;

    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === "on" ? "on" : "off";
    this.subscription = this.modeService.onModeDetect().subscribe((mode) => {
      if (mode) {
        this.mode = "off";
      } else {
        this.mode = "on";
      }
    });
  }

  ngOnInit(): void {


    let user_data = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    var userId = user_data.UserData._id;
    var companyCode = localStorage.getItem(localstorageconstants.COMPANYCODE);

  }

  onScroll() {
    console.log("onScroll call");
    this.start++;
    // this.getData();
  }

  setHeightStyles() {
    let styles = {
      height: window.screen.height + "px",
      "overflow-y": "scroll",
    };
    return styles;
  }
  setProgressBar(ratio) {
    return { width: `${ratio * 100}%` };
  }
}


