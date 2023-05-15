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
import { fromEvent } from 'rxjs';
import { showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { SelectionModel } from '@angular/cdk/collections';
import { AdvanceTable, RoleModel, User } from '../user.model';
import { UserRestoreFormComponent } from '../user-restore-form/user-restore-form.component';
import { Direction } from '@angular/cdk/bidi';
import { UserReportComponent } from '../user-report/user-report.component';

@Component({
  selector: 'app-user-grid',
  templateUrl: './user-grid.component.html',
  styleUrls: ['./user-grid.component.scss']
})
export class UserGridComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  isDelete = 0;
  userList: any = [];
  dataSource!: UserDataSource;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  active_word: string = "Active";
  inactive_word: string = "Inactive";
  titleMessage: string = "";
  selection = new SelectionModel<User>(true, []);
  advanceTable?: AdvanceTable;
  roleLists: Array<RoleModel> = [];


  constructor(
    public httpClient: HttpClient, private httpCall: HttpCall,
    public dialog: MatDialog, public userService: UserService,
    private snackBar: MatSnackBar, private router: Router,
  ) {
    super();
  }

  ngOnInit() {
    this.getUser();
  }

  async getUser() {
    const data = await this.userService.getUser(this.isDelete);
    this.userList = data;
  }
  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.getUser();
  }
  addNewUser() {
    this.router.navigate([WEB_ROUTES.USER_FORM]);
  }
  openHistory() {
    this.router.navigate([WEB_ROUTES.USER_HISTORY]);
  }
  userReport() {
    console.log("roleList", this.roleLists);

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
    const data = await this.userService.getRole();
    if (data.status) {
      this.roleLists = data.data;

    }
  }

  refresh() {
    this.getUser();
  }
  async archiveRecover(user: User, is_delete: number) {
    const data = await this.userService.deleteUser({ _id: user, is_delete: is_delete });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.getUser();

    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }
  async deleteUser(user: User, is_delete: number) {

    if (is_delete == 1) {
      this.titleMessage = "Are you sure you want to archive this user?";
    } else {
      this.titleMessage = "Are you sure you want to restore this user?";
    }
    swalWithBootstrapTwoButtons
      .fire({
        title: this.titleMessage,
        showDenyButton: true,
        confirmButtonText: "Yes",
        denyButtonText: "No",
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.archiveRecover(user, is_delete);
        }
      });
  }

  addNew(user: User) {
    let that = this;
    this.titleMessage = "Are you sure you want to restore this user?";
    swalWithBootstrapTwoButtons
      .fire({
        title: this.titleMessage,
        showDenyButton: true,
        confirmButtonText: "Yes",
        denyButtonText: "No",
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          console.log("user", user);
          let _id = user._id;


          let tempDirection: Direction;
          if (localStorage.getItem('isRtl') === 'true') {
            tempDirection = 'rtl';
          } else {
            tempDirection = 'ltr';
          }
          const dialogRef = this.dialog.open(UserRestoreFormComponent, {
            data: _id
          });
          this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
            if (result === 1) {
              // After dialog is closed we're doing frontend updates
              // For add we're just pushing a new row inside DataService
              // this.exampleDatabase?.dataChange.value.unshift(
              //   this.advanceTableService.getDialogData()
              // );

              // this.showNotification(
              //   'snackbar-success',
              //   'Add Record Successfully...!!!',
              //   'bottom',
              //   'center'
              // );
            }
          });

        }
      });


  }
  gotoUser() {
    console.log("call");
    localStorage.setItem(localstorageconstants.USER_DISPLAY, 'list');
    this.router.navigate([WEB_ROUTES.USER]);
  }
}
