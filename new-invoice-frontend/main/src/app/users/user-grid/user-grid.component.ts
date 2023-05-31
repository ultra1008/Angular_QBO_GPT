import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { WEB_ROUTES } from 'src/consts/routes';
import { UserService } from '../user.service';
import { UserDataSource } from '../users-listing/users-listing.component';
import {
  showNotification,
  swalWithBootstrapTwoButtons,
  timeDateToepoch,
} from 'src/consts/utils';
import { SelectionModel } from '@angular/cdk/collections';
import { AdvanceTable, RoleModel, User } from '../user.model';
import { UserRestoreFormComponent } from '../user-restore-form/user-restore-form.component';
import { UserReportComponent } from '../user-report/user-report.component';
import {
  FormateDateDDMMYYPipe,
  FormateDateStringPipe,
} from '../users-filter.pipe';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-user-grid',
  templateUrl: './user-grid.component.html',
  styleUrls: ['./user-grid.component.scss'],
  providers: [FormateDateStringPipe],
})
export class UserGridComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  isDelete = 0;
  userList: any = [];
  dataSource!: UserDataSource;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  active_word = 'Active';
  inactive_word = 'Inactive';
  titleMessage = '';
  selection = new SelectionModel<User>(true, []);
  advanceTable?: AdvanceTable;
  roleLists: Array<RoleModel> = [];
  username_search: any;
  username_status: any;
  tweet_epochs: any = [];
  cardLoading = true;

  constructor(
    public httpClient: HttpClient,
    private httpCall: HttpCall,
    public dialog: MatDialog,
    public userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private commonService: CommonService
  ) {
    super();
  }

  ngOnInit() {
    this.getUser();
  }
  changeStatus(event: any) {
    //
  }

  async getUser() {
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_USER_GET_FOR_TABLE,
      { is_delete: this.isDelete }
    );
    this.userList = data;
    this.cardLoading = false;
  }

  convertDate(date: any) {
    return timeDateToepoch(date);
  }

  editUser(user: User) {
    if (this.isDelete == 0) {
      this.router.navigate([WEB_ROUTES.USER_FORM], {
        queryParams: { _id: user._id },
      });
    }
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.cardLoading = true;
    this.userList = [];
    this.getUser();
  }

  addNewUser() {
    this.router.navigate([WEB_ROUTES.USER_FORM]);
  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.USER_HISTORY]);
  }

  userReport() {
    const dialogRef = this.dialog.open(UserReportComponent, {
      width: '700px',
      data: {
        roleList: this.roleLists,
        invoiceStatus: '',
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      //
    });
  }

  async getRole() {
    const data = await this.commonService.getRequestAPI(
      httpversion.PORTAL_V1 + httproutes.USER_SETTING_ROLES_ALL
    );
    if (data.status) {
      this.roleLists = data.data;
    }
  }

  refresh() {
    this.getUser();
  }

  async archiveRecover(user: User, is_delete: number) {
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.USER_DELETE,
      { _id: user._id, is_delete: is_delete }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.getUser();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async deleteUser(user: User, is_delete: number) {
    if (is_delete == 1) {
      this.titleMessage = 'Are you sure you want to archive this user?';
    } else {
      this.titleMessage = 'Are you sure you want to restore this user?';
    }
    swalWithBootstrapTwoButtons
      .fire({
        title: this.titleMessage,
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.archiveRecover(user, is_delete);
        }
      });
  }

  addNew(user: User) {
    this.titleMessage = 'Are you sure you want to restore this user?';
    swalWithBootstrapTwoButtons
      .fire({
        title: this.titleMessage,
        showDenyButton: true,
        confirmButtonText: 'Yes',
        denyButtonText: 'No',
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const dialogRef = this.dialog.open(UserRestoreFormComponent, {
            data: user._id,
          });
          this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
            if (result === 1) {
            }
          });
        }
      });
  }

  gotoUser() {
    localStorage.setItem(localstorageconstants.USER_DISPLAY, 'list');
    this.router.navigate([WEB_ROUTES.USER]);
  }
}
