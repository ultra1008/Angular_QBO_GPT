import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, fromEvent, map, merge } from 'rxjs';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { Invoice } from '../invoice.model';
import { InvoiceService } from '../invoice.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WEB_ROUTES } from 'src/consts/routes';
import { HttpCall } from 'src/app/services/httpcall.service';
import { numberWithCommas, showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { CommonService } from 'src/app/services/common.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { UploadInvoiceFormComponent } from '../upload-invoice-form/upload-invoice-form.component';
import { TranslateService } from '@ngx-translate/core';
import { TableElement } from 'src/app/shared/TableElement';
import { formatDate } from '@angular/common';
import { TableExportUtil } from 'src/app/shared/tableExportUtil';
import { localstorageconstants } from 'src/consts/localstorageconstants';

@Component({
  selector: 'app-invoice-listing',
  templateUrl: './invoice-listing.component.html',
  styleUrls: ['./invoice-listing.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class InvoiceListingComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = ['invoice_date', 'due_date', 'vendor', 'invoice_number', 'total_amount', 'sub_total', 'approver', 'status', 'actions'];
  invoiceService?: InvoiceService;
  dataSource!: ExampleDataSource;
  selection = new SelectionModel<Invoice>(true, []);
  id?: number;
  invoiceTable?: Invoice;
  isDelete = 0;
  type = '';
  role_permission: any;

  constructor (public httpClient: HttpClient, public dialog: MatDialog, public settingService: InvoiceService,
    private snackBar: MatSnackBar, public route: ActivatedRoute, private router: Router, private httpCall: HttpCall,
    private commonService: CommonService, public translate: TranslateService) {
    super();
    route.queryParams.subscribe(queryParams => {
      this.type = queryParams['type'] ?? '';
      this.type = this.type.replace(/_/g, ' ');
    });
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
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

  // TOOLTIPS
  getVendorNameTooltip(row: any) {
    return row.vendor_data.vendor_name;
  }
  getApproverTooltip(row: any) {
    return row.approver;
  }

  editInvoice(row: Invoice) {
    this.router.navigate([WEB_ROUTES.INVOICE_DETAILS], { queryParams: { _id: row._id } });
  }

  deleteInvoice(invoice: Invoice, is_delete: number) {
    let titleMessage;
    if (is_delete == 1) {
      titleMessage = this.translate.instant('CLIENT.CONFIRMATION_DIALOG.ARCHIVE');
    } else {
      titleMessage = this.translate.instant('CLIENT.CONFIRMATION_DIALOG.RESTORE');
    }
    swalWithBootstrapTwoButtons
      .fire({
        title: titleMessage,
        showDenyButton: true,
        confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
        denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
        allowOutsideClick: false,
      })
      .then(async (result) => {
        if (result.isConfirmed) {
          const data = await this.commonService.postRequestAPI(httpversion.PORTAL_V1 + httproutes.DELETE_INVOICE, { _id: invoice._id, is_delete: is_delete });
          if (data.status) {
            showNotification(this.snackBar, data.message, 'success');
            const foundIndex = this.invoiceService?.dataChange.value.findIndex((x) => x._id === invoice._id);
            if (foundIndex != null && this.invoiceService) {
              this.invoiceService.dataChange.value.splice(foundIndex, 1);
              this.refreshTable();
            }
          } else {
            showNotification(this.snackBar, data.message, 'error');
          }
        }
      });
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.refresh();
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
    this.invoiceService = new InvoiceService(this.httpCall);
    this.dataSource = new ExampleDataSource(
      this.invoiceService,
      this.paginator,
      this.sort,
      this.isDelete,
      this.type,
    );
    this.subs.sink = fromEvent(this.filter.nativeElement, 'keyup').subscribe(
      () => {
        if (!this.dataSource) {
          return;
        }
        this.dataSource.filter = this.filter.nativeElement.value;
      }
    );
    setTimeout(() => {
      this.router.navigate([WEB_ROUTES.INVOICE]).then();
    }, 1000);
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

  exportExcel() {
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x) => ({
        'Invoice Date': formatDate(new Date(Number(x.invoice_date_epoch.toString()) * 1000), 'MM/dd/yyyy', 'en'),
        'Due Date': formatDate(new Date(Number(x.due_date_epoch.toString()) * 1000), 'MM/dd/yyyy', 'en'),
        'Vendor': x.vendor_data.vendor_name,
        'Invoice Number': x.invoice_no,
        'Total Amount': x.invoice_total_amount,
        'Sub Total': x.sub_total,
        'Approver': x.assign_to_data?.userfullname,
        'Status': x.status,
      }));

    TableExportUtil.exportToExcel(exportData, 'excel');
  }

  numberWithCommas(amount: number) {
    return numberWithCommas(amount.toFixed(2));
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
    public _sort: MatSort,
    public isDelete: number,
    public type: string,
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
    this.exampleDatabase.getInvoiceTable(this.isDelete, this.type);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.exampleDatabase.data
          .slice()
          .filter((invoice: Invoice) => {
            const searchStr = (
              invoice.invoice_date_epoch +
              invoice.due_date_epoch +
              invoice.vendor_data.vendor_name +
              invoice.invoice_no +
              invoice.invoice_total_amount +
              invoice.sub_total +
              invoice.assign_to_data?.userfullname +
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
        case 'invoice_date_epoch':
          [propertyA, propertyB] = [a.invoice_date_epoch, b.invoice_date_epoch];
          break;
        case 'due_date_epoch':
          [propertyA, propertyB] = [a.due_date_epoch, b.due_date_epoch];
          break;
        case 'vendor':
          [propertyA, propertyB] = [a.vendor_data.vendor_name, b.vendor_data.vendor_name];
          break;
        case 'invoice_no':
          [propertyA, propertyB] = [a.invoice_no, b.invoice_no];
          break;
        case 'invoice_total_amount':
          [propertyA, propertyB] = [a.invoice_total_amount, b.invoice_total_amount];
          break;
        case 'sub_total':
          [propertyA, propertyB] = [a.sub_total, b.sub_total];
          break;
        case 'approver':
          [propertyA, propertyB] = [a.assign_to_data?.userfullname, b.assign_to_data?.userfullname];
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
