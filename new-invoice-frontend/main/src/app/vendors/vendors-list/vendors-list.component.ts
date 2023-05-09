import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DataSource } from '@angular/cdk/collections';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { SelectionModel } from '@angular/cdk/collections';
import { TableExportUtil } from 'src/app/shared/tableExportUtil';
import { TableElement } from 'src/app/shared/TableElement';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { VendorsService } from '../vendors.service';
import { TermModel, Vendor } from '../vendor-table.model';
import { Router } from '@angular/router';
import { HttpCall } from 'src/app/services/httpcall.service';
import { commonNewtworkAttachmentViewer, gallery_options, showNotification, swalWithBootstrapTwoButtons } from 'src/consts/utils';
import { NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from 'ngx-gallery-9';
import { VendorReportComponent } from '../vendor-report/vendor-report.component';
import { WEB_ROUTES } from 'src/consts/routes';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vendors-list',
  templateUrl: './vendors-list.component.html',
  styleUrls: ['./vendors-list.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class VendorsListComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  @ViewChild("gallery") gallery!: NgxGalleryComponent;
  galleryOptions!: NgxGalleryOptions[];
  galleryImages: NgxGalleryImage[] = [];
  imageObject = [];
  tmp_gallery: any;

  displayedColumns = [
    // 'select',
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
  vendorService?: VendorsService;
  dataSource!: VendorDataSource;
  selection = new SelectionModel<Vendor>(true, []);
  id?: number;
  advanceTable?: Vendor;
  isDelete = 0;
  termsList: Array<TermModel> = [];
  titleMessage: string = "";

  constructor(
    public httpClient: HttpClient, private httpCall: HttpCall,
    public dialog: MatDialog,
    public vendorTableService: VendorsService,
    private snackBar: MatSnackBar, private router: Router, public translate: TranslateService
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
    this.tmp_gallery = gallery_options();
    this.tmp_gallery.actions = [
      {
        icon: "fas fa-download",
        onClick: this.downloadButtonPress.bind(this),
        titleText: "download",
      },
    ];
    this.galleryOptions = [this.tmp_gallery];
    this.getTerms();
  }

  refresh() {
    this.loadData();
  }

  addNew() {
    this.router.navigate([WEB_ROUTES.VENDOR_FORM]);
  }

  editVendor(vendor: Vendor) {
    this.router.navigate([WEB_ROUTES.VENDOR_FORM], { queryParams: { _id: vendor._id } });
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
    //  
  }
  removeSelectedRows() {
    // 
  }
  public loadData() {
    this.vendorService = new VendorsService(this.httpCall);
    this.dataSource = new VendorDataSource(
      this.vendorService,
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

  // export table data in excel file
  exportExcel() {
    // key name with space add in brackets
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x) => ({
        'Vendor Name': x.vendor_name || '',
        'Vendor ID': x.vendor_id || '',
        'Customer ID': x.customer_id || '',
        'Phone': x.vendor_phone || '',
        'Email': x.vendor_email || '',
        'Address': x.vendor_address || '',
        'Status': x.vendor_status === 1 ? 'Active' : 'Inactive',
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
    const data = await this.vendorTableService.updateVendorStatus({ _id: vendor._id, vendor_status: status });
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
    const data = await this.vendorTableService.deleteVendor({ _id: vendor._id, is_delete: is_delete });
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
      this.titleMessage = this.translate.instant('VENDOR.CONFIRMATION_DIALOG.ARCHIVE');
    } else {
      this.titleMessage = this.translate.instant('VENDOR.CONFIRMATION_DIALOG.RESTORE');
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

  // View Network Attachment
  viewAttachment(vendor: Vendor) {
    this.galleryImages = commonNewtworkAttachmentViewer(vendor.vendor_attachment);
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
    public vendorService: VendorsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number,
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
          .filter((advanceTable: Vendor) => {
            const searchStr = (
              advanceTable.vendor_name +
              advanceTable.vendor_id +
              advanceTable.customer_id +
              advanceTable.vendor_phone +
              advanceTable.vendor_email +
              advanceTable.vendor_address
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
