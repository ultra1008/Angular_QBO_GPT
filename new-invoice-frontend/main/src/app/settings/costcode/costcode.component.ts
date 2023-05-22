import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent, BehaviorSubject, Observable, merge, map } from 'rxjs';
import { HttpCall } from 'src/app/services/httpcall.service';
import {
  showNotification,
  swalWithBootstrapTwoButtons,
} from 'src/consts/utils';
import { SettingsService } from '../settings.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { CostCodeTable } from '../settings.model';
import { CostCodeFormComponent } from './cost-code-form/cost-code-form.component';

@Component({
  selector: 'app-costcode',
  templateUrl: './costcode.component.html',
  styleUrls: ['./costcode.component.scss'],
})
export class CostcodeComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  displayedColumns = ['division', 'value', 'description', 'actions'];
  costcodeService?: SettingsService;
  dataSource!: CostCodeDataSource;
  selection = new SelectionModel<CostCodeTable>(true, []);
  id?: number;
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

  async archiveRecover(costcodeTable: CostCodeTable, is_delete: number) {
    const data = await this.SettingsService.deleteCostCode({
      _id: costcodeTable._id,
      is_delete: is_delete,
    });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex =
        this.SettingsService?.dataCostCodeChange.value.findIndex(
          (x) => x._id === costcodeTable._id
        );

      // for delete we use splice in order to remove single object from DataService
      if (foundIndex != null && this.SettingsService) {
        this.SettingsService.dataCostCodeChange.value.splice(foundIndex, 1);
        this.refreshTable();
        location.reload();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async deleteCostCode(costcodeTable: CostCodeTable, is_delete: number) {
    if (is_delete == 1) {
      this.titleMessage = this.translate.instant(
        'SETTINGS.SETTINGS_OTHER_OPTION.COST_CODE_MODULE.CONFIRMATION_DIALOG.ARCHIVE'
      );
    } else {
      this.titleMessage = this.translate.instant(
        'SETTINGS.SETTINGS_OTHER_OPTION.COST_CODE_MODULE.CONFIRMATION_DIALOG.RESTORE'
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
          this.archiveRecover(costcodeTable, is_delete);
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

  add() {
    const dialogRef = this.dialog.open(CostCodeFormComponent, {
      width: '350px',
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  edit(event: any) {
    const dialogRef = this.dialog.open(CostCodeFormComponent, {
      width: '350px',
      data: event,
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  public loadData() {
    this.costcodeService = new SettingsService(this.httpCall);
    this.dataSource = new CostCodeDataSource(
      this.costcodeService,
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
  onContextMenu(event: MouseEvent, item: CostCodeTable) {
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
export class CostCodeDataSource extends DataSource<CostCodeTable> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData1: CostCodeTable[] = [];
  renderedData: CostCodeTable[] = [];
  constructor(
    public costcodeTableService: SettingsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<CostCodeTable[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.costcodeTableService.dataCostCodeChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];

    this.costcodeTableService.getAllCostCodeTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data

        this.filteredData1 = this.costcodeTableService.datacostcode
          .slice()
          .filter((costcodeTable: CostCodeTable) => {
            const searchStr = (
              costcodeTable.division +
              costcodeTable.value +
              costcodeTable.description
            ).toLowerCase();
            return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
          });
        // Sort filtered data
        const sortedData = this.sortData(this.filteredData1.slice());
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
  sortData(data: CostCodeTable[]): CostCodeTable[] {
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
        case 'divison':
          [propertyA, propertyB] = [a.division, b.division];
          break;
        case 'value':
          [propertyA, propertyB] = [a.value, b.value];
          break;
        case 'description':
          [propertyA, propertyB] = [a.description, b.description];
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
