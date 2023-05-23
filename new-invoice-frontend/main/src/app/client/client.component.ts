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
import { Vendor, TermModel } from '../vendors/vendor-table.model';
import { VendorsService } from '../vendors/vendors.service';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ClientService } from './client.service';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class ClientComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit
{
  @ViewChild('gallery') gallery!: NgxGalleryComponent;
  galleryOptions!: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  imageObject = [];
  tmp_gallery: any;
  show: boolean = false;
  displayedColumns = [
    'select',
    'vendor_name',
    'vendor_id',
    'customer_id',
    'vendor_phone',
    'vendor_email',
    'vendor_address',
    'vendor_status',
    'vendor_attachment',
    'vendor_from',
    'actions',
  ];
  vendorService?: ClientService;
  dataSource!: VendorDataSource;
  selection = new SelectionModel<Vendor>(true, []);
  id?: number;
  isDelete = 0;
  termsList: Array<TermModel> = [];
  titleMessage: string = '';
  isQBSyncedCompany: boolean = false;
  rform?: any;
  selectedValue!: string;

  constructor(
    public httpClient: HttpClient,
    private httpCall: HttpCall,
    public dialog: MatDialog,
    public vendorTableService: ClientService,
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
  vendor_status: any = [''];

  ngOnInit() {
    this.rform = this.fb.group({
      vendor_status: [''],
    });

    if (this.isQBSyncedCompany) {
      this.displayedColumns = [
        'select',
        'vendor_name',
        'vendor_id',
        'customer_id',
        'vendor_phone',
        'vendor_email',
        'vendor_address',
        'vendor_status',
        'vendor_attachment',
        'vendor_from',
        'actions',
      ];
    } else {
      this.displayedColumns = [
        'select',
        'vendor_name',
        'vendor_id',
        'customer_id',
        'vendor_phone',
        'vendor_email',
        'vendor_address',
        'vendor_status',
        'vendor_attachment',
        'actions',
      ];
    }

    this.loadData();

    this.tmp_gallery = gallery_options();
    this.tmp_gallery.actions = [
      {
        icon: 'fas fa-download',
        onClick: this.downloadButtonPress.bind(this),
        titleText: 'download',
      },
    ];
    this.galleryOptions = [this.tmp_gallery];
    this.getTerms();
  }

  // TOOLTIPS
  getTooltip(row: any) {
    return row.vendor_email;
  }
  getAddTooltip(row: any) {
    return row.vendor_address;
  }
  getNameTooltip(row: any) {
    return row.vendor_name;
  }
  getCustomerIdTooltip(row: any) {
    return row.customer_id;
  }
  getVendorIdTooltip(row: any) {
    return row.vendor_id;
  }
  getPhonTooltip(row: any) {
    return row.vendor_phone;
  }

  refresh() {
    this.loadData();
  }
  onBookChange(ob: any) {
    console.log('Book changed...');
    let selectedBook = ob.value;
    console.log(selectedBook);
    if (selectedBook == 1) {
      swalWithBootstrapTwoButtons
        .fire({
          title: 'Are you sure you want to active all vendor?',
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
          title: 'Are you sure you want to Inactive all vendor?',
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
          title: 'Are you sure you want to archive all vendor?',
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
    const data = await this.vendorTableService.allDeleteVendor({
      _id: tmp_ids,
      is_delete: 1,
    });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      this.refresh();
      // const foundIndex = this.vendorService?.dataChange.value.findIndex(
      //   (x) => x._id === vendor._id
      // );
      // for delete we use splice in order to remove single object from DataService
      // if (foundIndex != null && this.vendorService) {
      //   this.vendorService.dataChange.value.splice(foundIndex, 1);

      // }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async allActive() {
    let tmp_ids = [];
    for (let i = 0; i < this.selection.selected.length; i++) {
      tmp_ids.push(this.selection.selected[i]._id);
    }
    const data = await this.vendorTableService.updateAllVendorStatus({
      _id: tmp_ids,
      vendor_status: 1,
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
    const data = await this.vendorTableService.updateAllVendorStatus({
      _id: tmp_ids,
      vendor_status: 2,
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

  editVendor(vendor: Vendor) {
    this.router.navigate([WEB_ROUTES.CLIENT_FORM], {
      queryParams: { _id: vendor._id },
    });
  }

  openHistory() {
    this.router.navigate([WEB_ROUTES.VENDOR_HISTORY]);
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
    this.vendorService = new ClientService(this.httpCall);
    this.dataSource = new VendorDataSource(
      this.vendorService,
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
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x) => ({
        'Vendor Name': x.vendor_name || '',
        'Vendor ID': x.vendor_id || '',
        'Customer ID': x.customer_id || '',
        Phone: x.vendor_phone || '',
        Email: x.vendor_email || '',
        Address: x.vendor_address || '',
        Status: x.vendor_status === 1 ? 'Active' : 'Inactive',
      }));

    TableExportUtil.exportToExcel(exportData, 'excel');
  }

  // context menu
  onContextMenu(event: MouseEvent, item: Vendor) {
    event.preventDefault();
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    if (this.contextMenu !== undefined && this.contextMenu.menu !== null) {
      this.contextMenu.menuData = { item: item };
      this.contextMenu.menu.focusFirstItem('mouse');
      this.contextMenu.openMenu();
    }
  }
  async updateStatus(vendor: Vendor) {
    let status = 1;
    if (vendor.vendor_status == 1) {
      status = 2;
    }
    const data = await this.vendorTableService.updateVendorStatus({
      _id: vendor._id,
      vendor_status: status,
    });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.vendorService?.dataChange.value.findIndex(
        (x) => x._id === vendor._id
      );
      if (foundIndex != null && this.vendorService) {
        this.vendorService.dataChange.value[foundIndex].vendor_status = status;
        this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async archiveRecover(vendor: Vendor, is_delete: number) {
    const data = await this.vendorTableService.deleteVendor({
      _id: vendor._id,
      is_delete: is_delete,
    });
    if (data.status) {
      showNotification(this.snackBar, data.message, 'success');
      const foundIndex = this.vendorService?.dataChange.value.findIndex(
        (x) => x._id === vendor._id
      );
      // for delete we use splice in order to remove single object from DataService
      if (foundIndex != null && this.vendorService) {
        this.vendorService.dataChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async deleteVendor(vendor: Vendor, is_delete: number) {
    if (is_delete == 1) {
      this.titleMessage = this.translate.instant(
        'VENDOR.CONFIRMATION_DIALOG.ARCHIVE'
      );
    } else {
      this.titleMessage = this.translate.instant(
        'VENDOR.CONFIRMATION_DIALOG.RESTORE'
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
          this.show = false;
        }
      });
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.refresh();
  }

  // View Network Attachment
  viewAttachment(vendor: Vendor) {
    this.galleryImages = commonNewtworkAttachmentViewer(
      vendor.vendor_attachment
    );
    setTimeout(() => {
      this.gallery.openPreview(0);
    }, 0);
  }

  downloadButtonPress(event: any, index: number): void {
    window.location.href = this.imageObject[index];
  }

  async getTerms() {
    const data = await this.vendorService?.getTerms();
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
export class VendorDataSource extends DataSource<Vendor> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: Vendor[] = [];
  renderedData: Vendor[] = [];
  constructor(
    public vendorService: ClientService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Vendor[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.vendorService.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.vendorService.getAllVendorTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.vendorService.data
          .slice()
          .filter((vendorTable: Vendor) => {
            const searchStr = (
              vendorTable.vendor_name +
              vendorTable.vendor_id +
              vendorTable.customer_id +
              vendorTable.vendor_phone +
              vendorTable.vendor_email +
              vendorTable.vendor_address
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
  sortData(data: Vendor[]): Vendor[] {
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
          [propertyA, propertyB] = [a.vendor_name, b.vendor_name];
          break;
        case 'vendor_id':
          [propertyA, propertyB] = [a.vendor_id, b.vendor_id];
          break;
        case 'customer_id':
          [propertyA, propertyB] = [a.customer_id, b.customer_id];
          break;
        case 'vendor_phone':
          [propertyA, propertyB] = [a.vendor_phone, b.vendor_phone];
          break;
        case 'vendor_email':
          [propertyA, propertyB] = [a.vendor_email, b.vendor_email];
          break;
        case 'vendor_address':
          [propertyA, propertyB] = [a.vendor_address, b.vendor_address];
          break;
        case 'vendor_status':
          [propertyA, propertyB] = [a.vendor_status, b.vendor_status];
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