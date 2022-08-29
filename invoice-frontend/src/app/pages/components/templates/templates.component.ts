import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { httproutes, icon, localstorageconstants } from 'src/app/consts';
import { HttpCall } from 'src/app/service/httpcall.service';
import { Mostusedservice } from 'src/app/service/mostused.service';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { UiSpinnerService } from 'src/app/service/spinner.service';
import { gallery_options, LanguageApp } from 'src/app/service/utils';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation, NgxGalleryImageSize, NgxGalleryComponent } from 'ngx-gallery-9';
import { configdata } from 'src/environments/configData';
import Swal from 'sweetalert2';
import { ModeDetectService } from '../map/mode-detect.service';
import { EmployeeService } from '../team/employee.service';
import { DomSanitizer } from '@angular/platform-browser';
const swalWithBootstrapButtons = Swal.mixin({
  customClass: {
    confirmButton: 'btn btn-success margin-right-cust',
    denyButton: 'btn btn-danger'
  },
  buttonsStyling: false,
  allowOutsideClick: false

});

class DataTablesResponse {
  data: any;
  draw: any;
  recordsFiltered: any;
  recordsTotal: any;
}
@Component({
  selector: 'app-templates',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent implements OnInit {
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  usersArray: any;
  btn_grid_list_text: any;
  listtogrid_text: any;
  gridtolist_text: any;
  sorting_asc: Boolean = false;
  sorting_desc: Boolean = false;
  soruing_all: Boolean = true;
  username_search: any;
  username_status: any;
  gridtolist: Boolean = true;
  addTeamMember: boolean = true;
  deleteTeamMember: boolean = true;
  locallanguage: any;
  isEmployeeData: Boolean = false;
  dtOptions: DataTables.Settings = {};
  User_Card_Do_Want_Delete: string = "";
  Compnay_Equipment_Delete_Yes: string = "";
  Compnay_Equipment_Delete_No: string = "";
  acticve_word: string = "";
  inacticve_word: string = "";
  mode: any;
  subscription!: Subscription;
  historyIcon!: string;
  trashIcon!: string;
  importIcon!: string;
  editIcon!: string;
  reportIcon!: string;
  role_to: any;
  allRoles = [];

  role_permission: any;

  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild('OpenFilebox') OpenFilebox: any;
  Company_Equipment_File_Not_Match: any;
  constructor(private modeService: ModeDetectService, private router: Router, public mostusedservice: Mostusedservice,
    public employeeservice: EmployeeService, public translate: TranslateService, public dialog: MatDialog,
    public httpCall: HttpCall, public snackbarservice: Snackbarservice, public uiSpinner: UiSpinnerService) {
    var userdata = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
    this.role_permission = userdata.role_permission.users;
    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.historyIcon = icon.HISTORY;
      this.trashIcon = icon.DELETE;
      this.importIcon = icon.IMPORT;
      this.editIcon = icon.EDIT;
      this.reportIcon = icon.REPORT;
    } else {
      this.historyIcon = icon.HISTORY_WHITE;
      this.trashIcon = icon.DELETE_WHITE;
      this.importIcon = icon.IMPORT_WHITE;
      this.editIcon = icon.EDIT_WHITE;
      this.reportIcon = icon.REPORT_WHITE;
    }
    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.historyIcon = icon.HISTORY;
        this.trashIcon = icon.DELETE;
        this.importIcon = icon.IMPORT;
        this.editIcon = icon.EDIT;
        this.reportIcon = icon.REPORT;
      } else {
        this.mode = 'on';
        this.historyIcon = icon.HISTORY_WHITE;
        this.trashIcon = icon.DELETE_WHITE;
        this.importIcon = icon.IMPORT_WHITE;
        this.editIcon = icon.EDIT_WHITE;
        this.reportIcon = icon.REPORT_WHITE;
      }
      this.rerenderfunc();
    });
    this.translate.stream(['']).subscribe((textarray) => {
      this.User_Card_Do_Want_Delete = this.translate.instant('User_Card_Do_Want_Delete');
      this.Compnay_Equipment_Delete_Yes = this.translate.instant('Compnay_Equipment_Delete_Yes');
      this.Compnay_Equipment_Delete_No = this.translate.instant('Compnay_Equipment_Delete_No');
      this.Company_Equipment_File_Not_Match = this.translate.instant('Company_Equipment_File_Not_Match');
    });
  }


  ngOnInit(): void {
    let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA) ?? '');
    console.log("role", role_permission.UserData.role_name);
    this.role_to = role_permission.UserData.role_name;
    // let role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA));
    // if (role_permission.role_permission.team.team.Add == false) {
    //   this.addTeamMember = false;
    // }
    // if (role_permission.role_permission.team.team.Delete == false) {
    //   this.deleteTeamMember = false;
    // }
    this.uiSpinner.spin$.next(true);
    let that = this;

    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    that.translate.use(this.locallanguage);
    let i = 0;
    this.translate.stream(['']).subscribe((textarray) => {
      that.acticve_word = this.translate.instant('Team-EmployeeList-Status-Active');
      that.inacticve_word = this.translate.instant('project_setting_inactive');

      that.translate.get('Employee-List-list-to-grid').subscribe((text: string) => {
        that.listtogrid_text = text;
      });

      that.translate.get('Employee-List-grid-to-list').subscribe((text: string) => {
        that.gridtolist_text = text; that.btn_grid_list_text = text;
      });

      if (this.locallanguage === 'en') {
        this.locallanguage = 'es';
      } else {
        this.locallanguage = 'en';
      }
      if (i != 0) {
        setTimeout(() => {
          that.rerenderfunc();
        }, 1000);
      }
      i++;
    });
    this.dtOptions = {
      pagingType: 'full_numbers',
      language: tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables
    };
    this.employeeservice.getalluser().subscribe(function (data) {
      that.uiSpinner.spin$.next(false);
      if (data.status) {
        that.isEmployeeData = true;
        that.usersArray = data.data;
      }
    });

    this.mostusedservice.deleteUserEmit$.subscribe(function (editdata) {
      that.employeeservice.getalluser().subscribe(function (data) {
        if (data.status) {
          that.isEmployeeData = true;
          that.usersArray = data.data;
        }
      });
    });

    this.getAllRoles();
  }



  ngAfterViewInit() {
    this.dtTrigger.next();
  }
 


  getAllRoles() {
    let that = this;
    this.httpCall.httpGetCall(httproutes.PORTAL_SETTING_ROLES_ALL).subscribe(function (params) {
      if (params.status) {
        that.allRoles = params.data;
      }
    });
  }

  openReportDialog() {
    const dialogRef = this.dialog.open(FileAttachment, {
      height: '400px',
      width: '700px',
      data: {},
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }



  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }



  rerenderfunc() {
    this.isEmployeeData = false;
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    let that = this;
    this.dtOptions.language = tmp_locallanguage == "en" ? LanguageApp.english_datatables : LanguageApp.spanish_datatables;
    setTimeout(() => {
      that.isEmployeeData = true;
    }, 100);
  }

  sorting_name() {
    if (this.sorting_desc) {
      this.sorting_desc = false;
      this.sorting_asc = true;
      this.soruing_all = false;
      this.usersArray = this.usersArray.sort((a: any, b: any) => a.username.localeCompare(b.username, 'en', { sensitivity: 'base' }));
    } else if (this.sorting_asc) {
      this.sorting_desc = true;
      this.sorting_asc = false;
      this.soruing_all = false;
      this.usersArray = this.usersArray.reverse((a: any, b: any) => a.username.localeCompare(b.username, 'en', { sensitivity: 'base' }));

    } else {
      this.sorting_desc = false;
      this.sorting_asc = true;
      this.soruing_all = false;
      this.usersArray = this.usersArray.sort((a: any, b: any) => a.username.localeCompare(b.username, 'en', { sensitivity: 'base' }));
    }
  }

  searchData(searchValue: any) {
    this.usersArray = this.usersArray.filter((item: any) => {
      return item.username.toLowerCase().includes(searchValue.toLowerCase());
    });
  }


  deleteTimecardButtonClick(id: any) {
    let that = this;
    swalWithBootstrapButtons.fire({
      title: that.User_Card_Do_Want_Delete,
      allowOutsideClick: false,
      showDenyButton: true,
      showCancelButton: false,
      confirmButtonText: this.Compnay_Equipment_Delete_Yes,
      denyButtonText: this.Compnay_Equipment_Delete_No,
    }).then((result) => {
      if (result.isConfirmed) {
        this.httpCall.httpPostCall(httproutes.TEAM_DELETE, { _id: id }).subscribe(function (params) {
          if (params.status) {
            that.snackbarservice.openSnackBar(params.message, "success");
            that.mostusedservice.userdeleteEmit();
          } else {
            that.snackbarservice.openSnackBar(params.message, "error");
          }
        });
      }
    });
  }



}


@Component({
  selector: 'attachment-form',
  templateUrl: './attachment-form.html',
  styleUrls: ['./templates.component.scss']
})
export class FileAttachment {
  @ViewChild('gallery')
  gallery!: NgxGalleryComponent;

  public form: any;
  selectedStatus: any;
  files_old: any = [];
  last_files_array: any = [];
  galleryOptions!: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  saveIcon: string;
  emailsList: any[] = [];
  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  Report_File_Message: string = "";
  Report_File_Enter_Email: string = "";
  exitIcon: string;
  yesButton: string = '';
  noButton: string = '';
  mode: any;
  subscription: Subscription;
  copyDataFromProject: string = '';
  add_my_self_icon = icon.ADD_MY_SELF_WHITE;
  _id!: string;
  fileIcon: string = "";

  constructor(private modeService: ModeDetectService, private formBuilder: FormBuilder, public httpCall: HttpCall,
    public dialogRef: MatDialogRef<FileAttachment>,
    @Inject(MAT_DIALOG_DATA) public data: any, public sb: Snackbarservice, public translate: TranslateService, public dialog: MatDialog, private sanitiser: DomSanitizer,
    public snackbarservice: Snackbarservice,
    private router: Router, public route: ActivatedRoute, public spinner: UiSpinnerService,) {




    var modeLocal = localStorage.getItem(localstorageconstants.DARKMODE);
    this.mode = modeLocal === 'on' ? 'on' : 'off';
    if (this.mode == 'off') {
      this.exitIcon = icon.CANCLE;
      this.saveIcon = icon.SAVE_WHITE;
      this.fileIcon = icon.REPORT;

    } else {
      this.exitIcon = icon.CANCLE_WHITE;
      this.saveIcon = icon.SAVE_WHITE;
      this.fileIcon = icon.REPORT_WHITE;
    }

    this.subscription = this.modeService.onModeDetect().subscribe(mode => {
      if (mode) {
        this.mode = 'off';
        this.exitIcon = icon.CANCLE;
        this.saveIcon = icon.SAVE_WHITE;
        this.fileIcon = icon.REPORT;

      } else {
        this.mode = 'on';
        this.exitIcon = icon.CANCLE_WHITE;
        this.saveIcon = icon.SAVE_WHITE;
        this.fileIcon = icon.REPORT_WHITE;

      }
      console.log("DARK MODE: " + this.mode);

    });

  }
  ngOnInit(): void {
    let tmp_gallery = gallery_options();
    this.galleryOptions = [
      tmp_gallery
    ];
  }


  files: File[] = [];



  /**
   * on file drop handler
   */
  onFileDropped($event: any[]) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files: any) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    this.files.splice(index, 1);
  }

  deleteFile_old(index: number) {
    this.last_files_array.splice(index, 1);
    this.files_old.splice(index, 1);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
      this.files.push(item);
    }
  }



  /*
    This method is used to display thumb image from local file.
    File/Image picker item is diplayed thmb based on file extensions.
  */
  thumbImage(file: any) {
    switch (file.type) {
      case 'application/pdf':
        return '../../../../../../assets/images/pdf.png';
        break;

      case 'image/png':
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case 'image/jpeg':
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case 'image/jpg':
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case 'image/gif':
        return this.sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
        break;

      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '../../../../../../assets/images/doc.png';
        break;

      case 'application/vnd.ms-excel':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return '../../../../../../assets/images/xls.png';
        break;

      case 'application/vnd.oasis.opendocument.text':
        return '../../../../../../assets/images/odt.png';
        break;

      case 'application/zip':
        return '../../../../../../assets/images/zip.png';
        break;

      case 'image/svg+xml':
        return '../../../../../../assets/images/svg.png';
        break;

      case 'application/vnd.ms-powerpoint':
        return '../../../../../../assets/images/ppt.png';
        break;

      default:
        return '../../../../../../assets/images/no-preview.png';
        break;
    }
  }

  /*
    This Method is used to display the Network Image.
    Find extension from url and display it from Wasabi. So this thumb is prepared from network only.
  */
  thumbNetworkImage(index: any) {
    var extension = this.last_files_array[index].substring(this.last_files_array[index].lastIndexOf('.') + 1);
    if (extension == "doc" || extension == "docx") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/doc.png';
    } else if (extension == "pdf") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf.png';
    } else if (extension == "xls" || extension == "xlsx" || extension == "csv") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/xls.png';
    } else if (extension == "zip") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/zip.png';
    } else if (extension == "ppt") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt.png';
    } else if (extension == "rtf") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf.png';
    } else if (extension == "odt") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/odt.png';
    } else if (extension == "txt") {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/txt.png';
    } else if (extension == "jpg" || extension == "png" || extension == "jpeg" || extension == "gif" || extension == "webp") {
      return this.last_files_array[index];
    } else {
      return 'https://s3.us-west-1.wasabisys.com/rovukdata/no-preview.png';
    }
  }

  /*
    This method is used for download provision on click of the thumb initially implemented
    now improved as an open the Full size preview.
  */
  imageNetworkPreview(allAttachment: any, index: any) {
    for (let i = 0; i < allAttachment.length; i++) {
      var extension = allAttachment[i].substring(allAttachment[i].lastIndexOf('.') + 1);
      if (extension == "jpg" || extension == "png" || extension == "jpeg" || extension == "gif" || extension == 'webp') {
        var srctmp: any = {
          small: allAttachment[i],
          medium: allAttachment[i],
          big: allAttachment[i]
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "doc" || extension == "docx") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "pdf") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "odt") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "rtf") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "txt") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "ppt") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png'
        };
        this.galleryImages.push(srctmp);
      } else if (extension == "xls" || extension == "xlsx" || extension == "csv") {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png'
        };
        this.galleryImages.push(srctmp);
      } else {
        var srctmp: any = {
          small: 'https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png',
          medium: 'https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png',
          big: 'https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png'
        };
        this.galleryImages.push(srctmp);
      }
    }
    setTimeout(() => {
      this.gallery.openPreview(index);
    }, 0
    );
  }

  openform() {
    this.router.navigate(['/template-form']);
  }

}
