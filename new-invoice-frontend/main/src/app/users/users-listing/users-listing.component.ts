import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { RoleModel, User } from './../user.model';
import { UserService } from '../user.service';
import { BehaviorSubject, Observable, fromEvent, merge } from 'rxjs';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatMenuTrigger } from '@angular/material/menu';
import { HttpCall } from 'src/app/services/httpcall.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { map } from 'rxjs/operators';
import { WEB_ROUTES } from 'src/consts/routes';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import {
  formatPhoneNumber,
  showNotification,
  swalWithBootstrapTwoButtons,
} from 'src/consts/utils';
import { TranslateService } from '@ngx-translate/core';
import { UserRestoreFormComponent } from '../user-restore-form/user-restore-form.component';
import { UserReportComponent } from '../user-report/user-report.component';
import { UntypedFormBuilder } from '@angular/forms';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { CommonService } from 'src/app/services/common.service';

@Component({
  selector: 'app-users-listing',
  templateUrl: './users-listing.component.html',
  styleUrls: ['./users-listing.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class UsersListingComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  displayedColumns = [
    'select',
    'img',
    'userfullname',
    'useremail',
    'userphone',
    'role_name',
    'userjob_title_name',
    'department_name',
    'userstatus',
    'actions',
  ];
  userService?: UserService;
  dataSource!: UserDataSource;
  selection = new SelectionModel<User>(true, []);
  isDelete = 0;
  advanceTable?: User;
  titleMessage = '';
  roleLists: Array<RoleModel> = [];
  userSelectForm?: any;
  selectedValue!: string;
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  constructor(
    public httpClient: HttpClient,
    private httpCall: HttpCall,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router,
    public userTableService: UserService,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    private commonService: CommonService
  ) {
    super();
  }

  ngOnInit() {
    this.userSelectForm = this.fb.group({
      userstatus: [''],
    });
    this.getRole();
    const userDisplay =
      localStorage.getItem(localstorageconstants.USER_DISPLAY) ?? 'list';
    if (userDisplay == 'list') {
      this.loadData();
    } else {
      this.router.navigate([WEB_ROUTES.USER_GRID]);
    }
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }
  openHistory() {
    this.router.navigate([WEB_ROUTES.USER_HISTORY]);
  }
  // TOOLTIP
  getEmailTooltip(row: any) {
    return row.useremail;
  }
  getNameTooltip(row: any) {
    return row.userfullname;
  }
  getPhoneTooltip(row: any) {
    return row.userphone;
  }
  getRoleTooltip(row: any) {
    return row.role_name;
  }
  getJobTitleTooltip(row: any) {
    return row.userjob_title_name;
  }
  getDepartmentTooltip(row: any) {
    return row.department_name;
  }
  onBookChange(ob: any) {
    const selectedBook = ob.value;
    if (selectedBook == 1) {
      swalWithBootstrapTwoButtons
        .fire({
          title: 'Are you sure you want to active all user?',
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allUserActive();
          }
        });
    } else if (selectedBook == 2) {
      swalWithBootstrapTwoButtons
        .fire({
          title: 'Are you sure you want to Inactive all user?',
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allUserInactive();
          }
        });
    } else if (selectedBook == 3) {
      swalWithBootstrapTwoButtons
        .fire({
          title: 'Are you sure you want to archive all user?',
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allArchiveUser();
          }
        });
    }
  }
  async allArchiveUser() {
    const tmp_ids = [];
    for (let i = 0; i < this.selection.selected.length; i++) {
      tmp_ids.push(this.selection.selected[i]._id);
    }
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_TERM_ALL_DELETE,
      { _id: tmp_ids, is_delete: 1 }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.refresh();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async allUserActive() {
    const tmp_ids = [];
    for (let i = 0; i < this.selection.selected.length; i++) {
      tmp_ids.push(this.selection.selected[i]._id);
    }
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_USER_STATUS_UPDATE,
      { _id: tmp_ids, userstatus: 1 }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.refresh();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async allUserInactive() {
    const tmp_ids = [];
    for (let i = 0; i < this.selection.selected.length; i++) {
      tmp_ids.push(this.selection.selected[i]._id);
    }
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_USER_STATUS_UPDATE,
      { _id: tmp_ids, userstatus: 2 }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.refresh();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async updateStatus(User: User) {
    let status = 1;
    if (User.userstatus == 1) {
      status = 2;
    }
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.PORTAL_ALL_USER_STATUS_CHANGE,
      { _id: User._id, userstatus: status }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.userService?.dataChange.value.findIndex(
        (x) => x._id === User._id
      );
      if (foundIndex != null && this.userService) {
        this.userService.dataChange.value[foundIndex].userstatus = status;
        this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.renderedData.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.renderedData.forEach((row) =>
          this.selection.select(row)
        );
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

  refresh() {
    this.loadData();
  }
  public loadData() {
    this.userService = new UserService(this.httpCall);
    this.dataSource = new UserDataSource(
      this.userService,
      this.paginator,
      this.sort,
      this.isDelete
    );
    this.subs.sink = fromEvent(this.filter.nativeElement, 'keyup').subscribe(
      () => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      }
    );
  }

  // context menu
  onContextMenu(event: MouseEvent, item: User) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
  phonenoFormat(data: any) {
    return formatPhoneNumber(data);
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    if (this.isDelete === 0) {
      this.displayedColumns = [
        'select',
        'img',
        'userfullname',
        'useremail',
        'userphone',
        'role_name',
        'userjob_title_name',
        'department_name',
        'userstatus',
        'actions',
      ];
    } else {
      this.displayedColumns = [
        'img',
        'userfullname',
        'useremail',
        'userphone',
        'role_name',
        'userjob_title_name',
        'department_name',
        'userstatus',
        'actions',
      ];
    }
    this.loadData();
  }
  async getRole() {
    const data = await this.commonService.getRequestAPI(
      httpversion.PORTAL_V1 + httproutes.USER_SETTING_ROLES_ALL
    );
    if (data.status) {
      this.roleLists = data.data;
    }
  }

  listToGrid() {
    localStorage.setItem(localstorageconstants.USER_DISPLAY, 'grid');
    this.router.navigate([WEB_ROUTES.USER_GRID]);
  }
  async archiveRecover(user: User, is_delete: number) {
    const data = await this.commonService.postRequestAPI(
      httpversion.PORTAL_V1 + httproutes.USER_DELETE,
      { _id: user._id, is_delete: is_delete }
    );
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.userService?.dataChange.value.findIndex(
        (x) => x._id === user._id
      );
      // for delete we use splice in order to remove single object from DataService
      if (foundIndex != null && this.userService) {
        this.userService.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
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
          if (is_delete == 1) {
            this.archiveRecover(user, is_delete);
          } else {
            this.addNew(user);
          }
        }
      });
  }

  addNew(user: User) {
    const _id = user._id;
    const dialogRef = this.dialog.open(UserRestoreFormComponent, {
      data: _id,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
      }
    });
  }
  addNewUser() {
    this.router.navigate([WEB_ROUTES.USER_FORM]);
  }
  editUser(user: User) {
    this.router.navigate([WEB_ROUTES.USER_FORM], {
      queryParams: { _id: user._id },
    });
  }
}

// This class is used for datatable sorting and searching
export class UserDataSource extends DataSource<User> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: User[] = [];
  renderedData: User[] = [];
  constructor(
    public userService: UserService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<User[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.userService.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.userService.getUserForTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.userService.data
          .slice()
          .filter((advanceTable: User) => {
            const searchStr = (
              advanceTable.userfullname +
              advanceTable.useremail +
              advanceTable.role_name +
              advanceTable.userphone +
              advanceTable.userjob_title_name +
              advanceTable.department_name
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData.slice());
        // Grab the page's slice of the filtered sorted data.
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        this.renderedData = sortedData.splice(
          startIndex,
          this.paginator.pageSize
        );
        return this.renderedData;
      })
    );
  }
  disconnect() {
    //disconnect
  }

  /** Returns a sorted copy of the database data. */
  sortData(data: User[]): User[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case '_id':
          [propertyA, propertyB] = [a._id, b._id];
          break;
        case 'userfullname':
          [propertyA, propertyB] = [a.userfullname, b.userfullname];
          break;
        case 'useremail':
          [propertyA, propertyB] = [a.useremail, b.useremail];
          break;
        case 'role_name':
          [propertyA, propertyB] = [a.role_name, b.role_name];
          break;
        case 'userphone':
          [propertyA, propertyB] = [a.userphone, b.userphone];
          break;
        case 'userjob_title_name':
          [propertyA, propertyB] = [a.userjob_title_name, b.userjob_title_name];
          break;
        case 'department_name':
          [propertyA, propertyB] = [a.department_name, b.department_name];
          break;
        case 'userstatus':
          [propertyA, propertyB] = [a.userstatus, b.userstatus];
          break;
      }
      const valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      const valueB = isNaN(+propertyB) ? propertyB : +propertyB;
      return (
        (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1)
      );
    });
  }
}
