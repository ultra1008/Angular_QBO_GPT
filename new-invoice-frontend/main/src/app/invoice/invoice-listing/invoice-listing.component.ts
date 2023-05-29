import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, fromEvent, map, merge } from 'rxjs';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { Invoice, InvoiceMessage } from '../invoice.model';
import { InvoiceService } from '../invoice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WEB_ROUTES } from 'src/consts/routes';
import { HttpCall } from 'src/app/services/httpcall.service';
import { showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { UploadInvoiceFormComponent } from '../upload-invoice-form/upload-invoice-form.component';

@Component({
  selector: 'app-invoice-listing',
  templateUrl: './invoice-listing.component.html',
  styleUrls: ['./invoice-listing.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class InvoiceListingComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = [
    'invoice_date',
    'due_date',
    'vendor',
    'invoice_number',
    'total_amount',
    'net_amount',
    'approver',
    'status',
    'actions',
  ];
  exampleDatabase?: InvoiceService;
  dataSource!: ExampleDataSource;
  selection = new SelectionModel<Invoice>(true, []);
  id?: number;
  invoiceTable?: Invoice;

  type = '';

  constructor (public httpClient: HttpClient, public dialog: MatDialog, public invoiceService: InvoiceService,
    private snackBar: MatSnackBar, public route: ActivatedRoute, private router: Router, private httpCall: HttpCall,
    private commonService: CommonService) {
    super();
    route.queryParams.subscribe(queryParams => {
      this.type = queryParams['type'] ?? '';
      this.type = this.type.replace(/_/g, ' ');
    });
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
    /* let tempDirection: Direction;
    if (localStorage.getItem('isRtl') === 'true') {
      tempDirection = 'rtl';
    } else {
      tempDirection = 'ltr';
    }
    const dialogRef = this.dialog.open(FormComponent, {
      data: {
        invoiceTable: this.invoiceTable,
        action: 'add',
      },
      direction: tempDirection,
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        // After dialog is closed we're doing frontend updates
        // For add we're just pushing a new row inside DataService
        this.exampleDatabase?.dataChange.value.unshift(
          this.invoiceService.getDialogData()
        );
        this.refreshTable();
        this.showNotification(
          'snackbar-success',
          'Add Record Successfully...!!!',
          'bottom',
          'center'
        );
      }
    }); */
  }
  editCall(row: Invoice) {
    this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { _id: '642aa86f28667a73474c388c' } });
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
  public loadData() {
    this.exampleDatabase = new InvoiceService(this.httpClient, this.httpCall);
    this.dataSource = new ExampleDataSource(
      this.exampleDatabase,
      this.paginator,
      this.sort
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
  onContextMenu(event: MouseEvent, item: Invoice) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }

  uploadInvoice() {
    const dialogRef = this.dialog.open(UploadInvoiceFormComponent, {
      width: '40%',
      data: {
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result: any) => {
      //  
    });
  }
}
export class ExampleDataSource extends DataSource<Invoice> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: Invoice[] = [];
  renderedData: Invoice[] = [];
  constructor (
    public exampleDatabase: InvoiceService,
    public paginator: MatPaginator,
    public _sort: MatSort
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Invoice[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.exampleDatabase.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.exampleDatabase.getInvoiceTable();
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.exampleDatabase.data
          .slice()
          .filter((invoice: Invoice) => {
            const searchStr = (
              invoice.invoice_date +
              invoice.due_date +
              invoice.vendor +
              invoice.invoice +
              invoice.invoice_total +
              invoice.net_amount +
              invoice.approver +
              invoice.status
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
  sortData(data: Invoice[]): Invoice[] {
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
        case 'invoice_date':
          [propertyA, propertyB] = [a.invoice_date, b.invoice_date];
          break;
        case 'due_date':
          [propertyA, propertyB] = [a.due_date, b.due_date];
          break;
        /* case 'vendor':
          [propertyA, propertyB] = [a.vendor, b.vendor];
          break; */
        case 'invoice':
          [propertyA, propertyB] = [a.invoice, b.invoice];
          break;
        case 'invoice_total':
          [propertyA, propertyB] = [a.invoice_total, b.invoice_total];
          break;
        case 'net_amount':
          [propertyA, propertyB] = [a.net_amount, b.net_amount];
          break;
        case 'approver':
          [propertyA, propertyB] = [a.approver, b.approver];
          break;
        case 'status':
          [propertyA, propertyB] = [a.status, b.status];
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
