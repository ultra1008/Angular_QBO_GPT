import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { icon } from 'src/app/consts';
import { Subscription } from 'rxjs';
import { ModeDetectService } from "../../map/mode-detect.service";
import Swal from 'sweetalert2';
import { Input } from '@angular/core';
import { Subject } from 'rxjs';
import { LanguageApp } from 'src/app/service/utils';

const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  allowOutsideClick: false
});



@Component({
  selector: 'app-cost-code',
  templateUrl: './cost-code.component.html',
  styleUrls: ['./cost-code.component.scss']
})
export class CostCodeComponent implements OnInit {
  mode: any;
  subscription: Subscription;
  exportIcon: string;
  importIcon: string;
  addIcon = icon.ADD_MY_SELF_WHITE;
  dtOptions_project: DataTables.Settings = {};
  copyDataFromProject: string = '';
  yesButton: string = '';
  noButton: string = '';
  Table_Costcode_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  Settings_Costcode_Division: string = "";
  Settings_Costcode: string = "";
  Settings_Costcode_Description: string = "";
  Settings_Costcode_Action: string = "";
  Expenses_Action_Edit: string = "";
  Expenses_Action_Delete: string = "";
  locallanguage: any;
  dtTrigger: any = new Subject();

  constructor(private modeService: ModeDetectService,) {
    var modeLocal = localStorage.getItem('darkmood');
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.importIcon = icon.IMPORT;
      this.exportIcon = icon.EXPORT;

    } else {
      this.importIcon = icon.IMPORT_WHITE;
      this.exportIcon = icon.EXPORT_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {

      if (mode) {
        this.mode = 'off';
        this.importIcon = icon.IMPORT;
        this.exportIcon = icon.EXPORT;
      } else {
        this.mode = 'on';
        this.importIcon = icon.IMPORT_WHITE;
        this.exportIcon = icon.EXPORT_WHITE;
      }

      console.log("DARK MODE: " + this.mode);
    });
  }

  @Input() module_name: any;
  ngOnInit(): void {

    var tmp_locallanguage = localStorage.getItem("sitelanguage");

    this.dtOptions_project = {
      pagingType: 'full_numbers',
      pageLength: 10,
      serverSide: true,
      processing: true,
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables,


      columns: this.getColumName(),
      "drawCallback": () => {


      }

    };
  }




  getColumName() {
    let that = this;
    return [{
      title: "divison",
      data: "division"
    },

    {
      title: "Cost Code",
      data: 'value'
    },
    {
      title: "Description",
      data: 'description'
    },
    {
      title: "Action",
      render: function (data: any, type: any, full: any) {
        //     return `
        //     <div class="dropdown">
        //       <i class="fas fa-ellipsis-v cust-fontsize-tmp float-right-cust" aria-hidden="true"></i>
        //       <div class="dropdown-content-cust">
        //         <a edit_tmp_id='`+ JSON.stringify(full) + `' class="button_costcodeEditClass` + that.module_name + `" >` + '<img src="' +  + '" alt="" height="15px">' + that.Expenses_Action_Edit + `</a>
        //         <a edit_tmp_id='`+ JSON.stringify(full) + `' class="button_costcodeDeleteClass` + that.module_name + `" >` + '<img src="' +  + '" alt="" height="15px">' + that.Expenses_Action_Delete + `</a>
        //       </div>
        //   </div>
        //  `;
      },
      width: "7%",
      orderable: false
    }
    ];
  }
}






