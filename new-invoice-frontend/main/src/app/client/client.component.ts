import { SelectionModel, DataSource } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  NgxGalleryComponent,
  NgxGalleryOptions,
  NgxGalleryImage,
} from 'ngx-gallery-9';
import { fromEvent, BehaviorSubject, Observable, merge, map } from 'rxjs';
import { WEB_ROUTES } from 'src/consts/routes';
import {
  gallery_options,
  swalWithBootstrapTwoButtons,
  showNotification,
  commonNewtworkAttachmentViewer,
} from 'src/consts/utils';
import { HttpCall } from '../services/httpcall.service';
import { TableElement } from '../shared/TableElement';
import { UnsubscribeOnDestroyAdapter } from '../shared/UnsubscribeOnDestroyAdapter';
import { TableExportUtil } from '../shared/tableExportUtil';
import { VendorReportComponent } from '../vendors/vendor-report/vendor-report.component';
import { Vendor, TermModel } from '../vendors/vendor.model';
import { VendorsService } from '../vendors/vendors.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ClientService } from './client.service';
import { ClientList } from './client.model';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class ClientComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  show: boolean = false;
  displayedColumns = [
    'select',
    'client_name',
    'client_number',
    'client_email',
    'approver_id',
    'client_cost_cost_id',
    'client_status',
    'actions',
  ];
  clientService?: ClientService;
  dataSource!: ClientDataSource;
  selection = new SelectionModel<ClientList>(true, []);
  id?: number;
  isDelete = 0;
  termsList: Array<TermModel> = [];
  titleMessage: string = '';
  isQBSyncedCompany: boolean = false;
  rform?: any;
  selectedValue!: string;

  constructor (
    public httpClient: HttpClient,
    private httpCall: HttpCall,
    public dialog: MatDialog,
    public clientTableService: ClientService,
    private snackBar: MatSnackBar,
    private router: Router,
    public translate: TranslateService,
    private fb: UntypedFormBuilder
  ) {
    super();
  }
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  client_status: any = [''];

  ngOnInit() {
    this.rform = this.fb.group({
      client_status: [''],
    });

    this.loadData();

    this.getTerms();
  }

  // TOOLTIPS
  getTooltip(row: any) {
    return row.client_email;
  }
  getNameTooltip(row: any) {
    return row.client_name;
  }
  getCostCodeTooltip(row: any) {
    return row.client_cost_cost.cost_code;
  }
  getNumberTooltip(row: any) {
    return row.client_number;
  }
  getApproverTooltip(row: any) {
    return row.approver.userfullname;
  }

  refresh() {
    this.loadData();
  }
  onBookChange(ob: any) {
    let selectedBook = ob.value;
    console.log(selectedBook);
    if (selectedBook == 1) {
      swalWithBootstrapTwoButtons
        .fire({
          title: this.translate.instant(
            'CLIENT.CONFIRMATION_DIALOG.ALL_ACTIVE'
          ),
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allActive();
          }
        });
    } else if (selectedBook == 2) {
      swalWithBootstrapTwoButtons
        .fire({
          title: this.translate.instant(
            'CLIENT.CONFIRMATION_DIALOG.ALL_INACTIVE'
          ),
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allInactive();
          }
        });
    } else if (selectedBook == 3) {
      swalWithBootstrapTwoButtons
        .fire({
          title: this.translate.instant(
            'CLIENT.CONFIRMATION_DIALOG.ALL_ARCHIVE'
          ),
          showDenyButton: true,
          confirmButtonText: this.translate.instant('COMMON.ACTIONS.YES'),
          denyButtonText: this.translate.instant('COMMON.ACTIONS.NO'),
          allowOutsideClick: false,
        })
        .then((result) => {
          if (result.isConfirmed) {
            this.allArchive();
          }
        });
    }
  }

  async allArchive() {
    let tmp_ids = [];
    for (let i = 0; i < this.selection.selected.length; i++) {
      tmp_ids.push(this.selection.selected[i]._id);
    }
    const data = await this.clientTableService.allDeleteClient({
      _id: tmp_ids,
      is_delete: 1,
    });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.refresh();
      location.reload();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async allActive() {
    let tmp_ids = [];
    for (let i = 0; i < this.selection.selected.length; i++) {
      tmp_ids.push(this.selection.selected[i]._id);
    }
    const data = await this.clientTableService.updateAllclientStatus({
      _id: tmp_ids,
      client_status: 1,
    });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.refresh();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async allInactive() {
    let tmp_ids = [];
    for (let i = 0; i < this.selection.selected.length; i++) {
      tmp_ids.push(this.selection.selected[i]._id);
    }
    const data = await this.clientTableService.updateAllclientStatus({
      _id: tmp_ids,
      client_status: 2,
    });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.refresh();
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  addNew() {
    this.router.navigate([WEB_ROUTES.CLIENT_FORM]);
  }

  editClient(client: ClientList) {
    this.router.navigate([WEB_ROUTES.CLIENT_FORM], {
      queryParams: { _id: client._id },
    });
  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.CLIENT_HISTORY]);
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
    console.log('numRows', this.selection.selected);
  }
  removeSelectedRows() {
    console.log('All Selected removed option selected');
  }
  public loadData() {
    this.show = false;
    console.log('Vendor loadData call');
    this.clientService = new ClientService(this.httpCall);
    this.dataSource = new ClientDataSource(
      this.clientService,
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
    this.show = true;
  }

  // export table data in excel file
  exportExcel() {
    // key name with space add in brackets
    //  const exportData: Partial<TableElement>[] =
    //       this.dataSource.filteredData.map((x) => ({
    //         'Vendor Name': x.vendor_name || '',
    //         'Vendor ID': x.vendor_id || '',
    //         'Customer ID': x.customer_id || '',
    //         Phone: x.vendor_phone || '',
    //         Email: x.vendor_email || '',
    //         Address: x.vendor_address || '',
    //         Status: x.vendor_status === 1 ? 'Active' : 'Inactive',
    //       }));
    //     TableExportUtil.exportToExcel(exportData, 'excel');
  }

  // context menu
  onContextMenu(event: MouseEvent, item: ClientList) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
  async updateStatus(client: ClientList) {
    let status = 1;
    if (client.client_status == 1) {
      status = 2;
    }
    const data = await this.clientTableService.updateClientStatus({
      _id: client._id,
      client_status: status,
    });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.clientService?.dataClientChange.value.findIndex(
        (x) => x._id === client._id
      );
      if (foundIndex != null && this.clientService) {
        this.clientService.dataClientChange.value[foundIndex].client_status =
          status;
        this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async archiveRecover(client: ClientList, is_delete: number) {
    const data = await this.clientTableService.deleteClient({
      _id: client._id,
      is_delete: is_delete,
    });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.clientService?.dataChange.value.findIndex(
        (x) => x._id === client._id
      );
      // for delete we use splice in order to remove single object from DataService
      if (foundIndex != null && this.clientService) {
        this.clientService.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
        location.reload();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async deleteVendor(client: ClientList, is_delete: number) {
    if (is_delete == 1) {
      this.titleMessage = this.translate.instant(
        'CLIENT.CONFIRMATION_DIALOG.ARCHIVE'
      );
    } else {
      this.titleMessage = this.translate.instant(
        'CLIENT.CONFIRMATION_DIALOG.RESTORE'
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
          this.archiveRecover(client, is_delete);
          this.show = false;
        }
      });
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    if (this.isDelete === 0) {
      this.displayedColumns = [
        'select',
        'client_name',
        'client_number',
        'client_email',
        'approver_id',
        'client_cost_cost_id',
        'client_status',
        'actions',
      ];
    } else {
      this.displayedColumns = [
        'client_name',
        'client_number',
        'client_email',
        'approver_id',
        'client_cost_cost_id',
        'client_status',
        'actions',
      ];
    }
    this.refresh();
  }

  async getTerms() {
    const data = await this.clientService?.getTerms();
    if (data.status) {
      this.termsList = data.data;
    }
  }

  vendorReport() {
    const dialogRef = this.dialog.open(VendorReportComponent, {
      width: '700px',
      data: {
        termsList: this.termsList,
        invoiceStatus: '',
      },
    });
    this.subs.sink = dialogRef.afterClosed().subscribe((result) => {
      //
    });
  }
}

// This class is used for datatable sorting and searching
export class ClientDataSource extends DataSource<ClientList> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: ClientList[] = [];
  renderedData: ClientList[] = [];
  constructor (
    public clientService: ClientService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<ClientList[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.clientService.dataClientChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.clientService.getAllClientTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.clientService.dataClient
          .slice()
          .filter((ClientList: ClientList) => {
            const searchStr = (
              ClientList.client_name +
              ClientList.client_email +
              ClientList.client_status +
              ClientList.approver_id +
              ClientList.client_cost_cost_id
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
  sortData(data: ClientList[]): ClientList[] {
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
        case 'vendor_name':
          [propertyA, propertyB] = [a.client_name, b.client_name];
          break;
        case 'vendor_id':
          [propertyA, propertyB] = [a.client_number, b.client_number];
          break;
        case 'customer_id':
          [propertyA, propertyB] = [a.client_email, b.client_email];
          break;
        case 'vendor_phone':
          [propertyA, propertyB] = [a.client_status, b.client_status];
          break;
        case 'vendor_email':
          [propertyA, propertyB] = [a.approver_id, b.approver_id];
          break;
        case 'vendor_address':
          [propertyA, propertyB] = [
            a.client_cost_cost_id,
            b.client_cost_cost_id,
          ];
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
