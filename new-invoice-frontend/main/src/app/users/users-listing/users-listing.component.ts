import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { User } from './../user.model';
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
import { local } from 'd3';
import { localstorageconstants } from 'src/consts/localstorageconstants';

@Component({
  selector: 'app-users-listing',
  templateUrl: './users-listing.component.html',
  styleUrls: ['./users-listing.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class UsersListingComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = [
    // 'select',
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

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  constructor (
    public httpClient: HttpClient, private httpCall: HttpCall,
    public dialog: MatDialog,
    private snackBar: MatSnackBar, private router: Router
  ) {
    super();
  }

  ngOnInit() {
    const userDisplay = localStorage.getItem(localstorageconstants.USER_DISPLAY) ?? 'list';
    if (userDisplay == 'list') {
      this.loadData();
    } else {
      this.router.navigate([WEB_ROUTES.USER_GRID]);
    }
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }

  public loadData() {
    this.userService = new UserService(this.httpCall);
    this.dataSource = new UserDataSource(
      this.userService,
      this.paginator,
      this.sort,
      this.isDelete,
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

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.loadData();
  }

  listToGrid() {
    localStorage.setItem(localstorageconstants.USER_DISPLAY, 'grid');
    this.router.navigate([WEB_ROUTES.USER_GRID]);
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
  constructor (
    public userService: UserService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number,
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
