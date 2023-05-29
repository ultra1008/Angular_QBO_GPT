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
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import {
  showNotification,
  swalWithBootstrapButtons,
  swalWithBootstrapTwoButtons,
} from 'src/consts/utils';
import { DocumentTypeTable } from '../../settings.model';
import { SettingsService } from '../../settings.service';
import { DocumentTypeFormComponent } from '../document-type-form/document-type-form.component';

@Component({
  selector: 'app-document-type-list',
  templateUrl: './document-type-list.component.html',
  styleUrls: ['./document-type-list.component.scss'],
})
export class DocumentTypeListComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  displayedColumns = ['document_type_name', 'is_expiration', 'actions'];
  documentService?: SettingsService;
  dataSource!: DocumentTypeDataSource;
  selection = new SelectionModel<DocumentTypeTable>(true, []);
  id?: number;
  // advanceTable?: DocumentTypeTable;
  isDelete = 0;
  titleMessage = '';

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

  editMailbox(mailbox: DocumentTypeTable) {
    this.router.navigate(['/settings/mailbox-form'], {
      queryParams: { _id: mailbox._id },
    });
  }

  edit(Document: any) {
    let that = this;
    console.log('document');
    const dialogRef = this.dialog.open(DocumentTypeFormComponent, {
      width: '350px',
      data: Document,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      that.refreshTable();
    });
  }

  async deleteDocumentType(Document: any) {
    let that = this;
    swalWithBootstrapButtons
      .fire({
        title: this.translate.instant(
          'SETTINGS.SETTINGS_OTHER_OPTION.EMPLOYEE_MODULE.CONFIRMATION_DIALOG.DOCUMENT'
        ),
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await that.SettingsService.DeleteDocumentType(
            Document._id
          );
          if (data.status) {
            showNotification(that.snackBar, data.message, 'success');
            that.loadData();
            /* console.log("this.SettingsService?.dataDocumentTypeChange: ", this.SettingsService?.dataDocumentTypeChange.value);
            const foundIndex = this.SettingsService?.dataDocumentTypeChange.value.findIndex(
              (x) => {
                console.log("sagar match: ", x._id, Document._id);
                x._id === Document._id;
              }
            );
            console.log("foundIndex: ", foundIndex);
            // for delete we use splice in order to remove single object from DataService
            if (foundIndex != null && this.SettingsService) {
              this.SettingsService.dataDocumentTypeChange.value.splice(foundIndex, 1);
              this.refreshTable();
            } */
          } else {
            showNotification(that.snackBar, data.message, 'error');
          }
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
    //   const totalSelect = this.selection.selected.length;
    //   this.selection.selected.forEach((item) => {
    //     const index: number = this.dataSource.renderedData.findIndex(
    //       (d) => d === item
    //     );
    //     // console.log(this.dataSource.renderedData.findIndex((d) => d === item));
    //     this.documentService?.dataChange.value.splice(index, 1);
    //     this.refreshTable();
    //     this.selection = new SelectionModel<DocumentTypeTable>(true, []);
    //   });
    //  showNotification(
    //     'snackbar-danger',
    //     totalSelect + ' Record Delete Successfully...!!!',
    //     'bottom',
    //     'center'
    //   );
  }
  public loadData() {
    this.documentService = new SettingsService(this.httpCall);
    this.dataSource = new DocumentTypeDataSource(
      this.documentService,
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
  onContextMenu(event: MouseEvent, item: DocumentTypeTable) {
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
export class DocumentTypeDataSource extends DataSource<DocumentTypeTable> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: DocumentTypeTable[] = [];
  renderedData: DocumentTypeTable[] = [];
  constructor(
    public documentService: SettingsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentTypeTable[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.documentService.dataDocumentTypeChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.documentService.getAllDocumentTypeTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.documentService.datadocumenttype
          .slice()
          .filter((documentTable: DocumentTypeTable) => {
            const searchStr = (
              documentTable.document_type_name +
              documentTable.is_expiration
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
  sortData(data: DocumentTypeTable[]): DocumentTypeTable[] {
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
        case 'document_type_name':
          [propertyA, propertyB] = [a.document_type_name, b.document_type_name];
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
