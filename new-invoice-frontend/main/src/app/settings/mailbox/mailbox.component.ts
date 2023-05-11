import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AdvanceTable } from '../settings.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, fromEvent, map, merge } from 'rxjs';
import { SettingsService } from '../settings.service';
import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  MatSnackBar,
  MatSnackBarVerticalPosition,
  MatSnackBarHorizontalPosition,
} from '@angular/material/snack-bar';
import { TableElement } from 'src/app/shared/TableElement';
import { TableExportUtil } from 'src/app/shared/tableExportUtil';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import {
  showNotification,
  swalWithBootstrapTwoButtons,
} from 'src/consts/utils';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-mailbox',
  templateUrl: './mailbox.component.html',
  styleUrls: ['./mailbox.component.scss'],
})
export class MailboxComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  displayedColumns = [
    'email',
    'imap',
    'port',
    'time',
    'actions',
  ];
  mailboxDatabase?: SettingsService;
  dataSource!: MailboxDataSource;
  selection = new SelectionModel<AdvanceTable>(true, []);
  id?: number;
  advanceTable?: AdvanceTable;
  isDelete = 0;
  titleMessage: string = '';


  constructor(
    public dialog: MatDialog,
    public SettingsService: SettingsService,
    private snackBar: MatSnackBar,
    public router: Router,
    private httpCall: HttpCall,
    public translate: TranslateService
  ) {
    super();
  }
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  ngOnInit() {
    this.loadData();
  }
  refresh() {
    this.loadData();
  }
  addNew() {
    this.router.navigate(['/settings/mailbox-form']);
  }

  editMailbox(settings: AdvanceTable) {
    this.router.navigate(['/settings/mailbox-form'], {
      queryParams: { _id: settings._id },
    });
  }

  async archiveRecover(vendor: AdvanceTable, is_delete: number) {
    const data = await this.SettingsService.deleteMailbox({
      _id: vendor._id,
      is_delete: is_delete,
    });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.SettingsService?.dataChange.value.findIndex(
        (x) => x._id === vendor._id
      );

      // for delete we use splice in order to remove single object from DataService
      if (foundIndex != null && this.SettingsService) {
        this.SettingsService.dataChange.value.splice(foundIndex, 1);
        // this.refreshTable();
        location.reload();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async deleteVendor(vendor: AdvanceTable, is_delete: number) {
    if (is_delete == 1) {
      this.titleMessage = this.translate.instant(
        'SETTINGS.SETTINGS_OTHER_OPTION.MAIL_BOX.CONFIRMATION_DIALOG.ARCHIVE'
      );
    } else {
      this.titleMessage = this.translate.instant(
        'SETTINGS.SETTINGS_OTHER_OPTION.MAIL_BOX.CONFIRMATION_DIALOG.RESTORE'
      );
    }
    swalWithBootstrapTwoButtons
      .fire({
        title: this.titleMessage,
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then((result) => {
        if (result.isConfirmed) {
          this.archiveRecover(vendor, is_delete);
        }
      });
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.loadData();
  }

  private refreshTable() {
    this.paginator._changePageSize(this.paginator.pageSize);
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.renderedData.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.renderedData.forEach((row) =>
        this.selection.select(row)
      );
  }
  removeSelectedRows() {

  }
  public loadData() {
    this.mailboxDatabase = new SettingsService(this.httpCall);
    this.dataSource = new MailboxDataSource(
      this.mailboxDatabase,
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


  back() {
    this.router.navigate(['/settings']);
  }

  // context menu
  onContextMenu(event: MouseEvent, item: AdvanceTable) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
}
export class MailboxDataSource extends DataSource<AdvanceTable> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: AdvanceTable[] = [];
  renderedData: AdvanceTable[] = [];
  constructor(
    public mailboxDatabase: SettingsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<AdvanceTable[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.mailboxDatabase.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.mailboxDatabase.getAllMailboxTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.mailboxDatabase.data
          .slice()
          .filter((advanceTable: AdvanceTable) => {
            const searchStr = (
              advanceTable.email +
              advanceTable.imap +
              advanceTable.port +
              advanceTable.time
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
  sortData(data: AdvanceTable[]): AdvanceTable[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'id':
          [propertyA, propertyB] = [a._id, b._id];
          break;
        case 'email':
          [propertyA, propertyB] = [a.email, b.email];
          break;
        case 'imap':
          [propertyA, propertyB] = [a.imap, b.imap];
          break;
        case 'port':
          [propertyA, propertyB] = [a.port, b.port];
          break;
        case 'time':
          [propertyA, propertyB] = [a.time, b.time];
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
