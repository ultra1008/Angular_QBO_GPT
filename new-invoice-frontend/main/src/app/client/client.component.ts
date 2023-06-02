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
import { TermModel } from '../vendors/vendor.model';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { ClientService } from './client.service';
import { ClientList } from './client.model';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { UiSpinnerService } from '../services/ui-spinner.service';
import * as XLSX from 'xlsx';
import { ImportClientComponent } from './import-client/import-client.component';
import { ExitsDataListComponent } from './exits-data-list/exits-data-list.component';
import { icon } from 'src/consts/icon';
import { CommonService } from '../services/common.service';
import { localstorageconstants } from 'src/consts/localstorageconstants';


@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
})
export class ClientComponent
  extends UnsubscribeOnDestroyAdapter
  implements OnInit {
  displayedColumns = ['select', 'client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'actions'];
  clientService?: ClientService;
  dataSource!: ClientDataSource;
  selection = new SelectionModel<ClientList>(true, []);
  id?: number;
  isDelete = 0;
  termsList: Array<TermModel> = [];
  titleMessage = '';
  isQBSyncedCompany = false;
  rform?: any;
  exitData!: any[];
  selectedValue!: string;
  @ViewChild('OpenFilebox') OpenFilebox!: ElementRef<HTMLElement>;
  role_permission: any;

  quickbooksGreyIcon = icon.QUICKBOOKS_GREY;
  quickbooksGreenIcon = icon.QUICKBOOKS_GREEN;
  is_quickbooks = true;

  constructor(
    public httpClient: HttpClient,
    private httpCall: HttpCall,
    public dialog: MatDialog,
    public clientTableService: ClientService,
    private snackBar: MatSnackBar,
    private router: Router,
    public translate: TranslateService,
    private fb: UntypedFormBuilder,
    public uiSpinner: UiSpinnerService,
    private commonService: CommonService
  ) {
    super();
    this.role_permission = JSON.parse(localStorage.getItem(localstorageconstants.USERDATA)!);
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
    this.getCompanyTenants();
    this.getTerms();
  }

  async getCompanyTenants() {
    const data = await this.commonService.getRequestAPI(httpversion.PORTAL_V1 + httproutes.GET_COMPNAY_SMTP);
    if (data.status) {
      this.is_quickbooks = data.data.is_quickbooks_online || data.data.is_quickbooks_desktop;
      if (this.is_quickbooks) {
        this.displayedColumns = ['select', 'client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'is_quickbooks', 'actions'];
      } else {
        this.displayedColumns = ['select', 'client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'actions'];
      }
    }
    // this.loadData();
  }

  // TOOLTIPS
  getTooltip(row: any) {
    return row.client_email;
  }
  getNameTooltip(row: any) {
    return row.client_name;
  }
  getCostCodeTooltip(row: any) {
    return row.client_cost_cost?.cost_code;
  }
  getNumberTooltip(row: any) {
    return row.client_number;
  }
  getApproverTooltip(row: any) {
    return row.approver?.userfullname;
  }

  refresh() {
    this.loadData();
  }
  onBookChange(ob: any) {
    const selectedBook = ob.value;
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
    const tmp_ids = [];
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

    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async allActive() {
    const tmp_ids = [];
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
    const tmp_ids = [];
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
    if (this.isDelete == 0) {
      this.router.navigate([WEB_ROUTES.CLIENT_FORM], {
        queryParams: { _id: client._id },
      });
    }
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
    this.selection.clear();
    // this.show = true;
  }

  // export table data in excel file
  exportExcel() {
    // key name with space add in brackets
    const exportData: Partial<TableElement>[] =
      this.dataSource.filteredData.map((x) => ({
        'Client/Job Name': x.client_name || '',
        'Client Number': x.client_number || '',
        'Job Contact Email': x.client_email || '',
        'Approver': x.approver?.userfullname || '',
        'Job Cost Code/GL Account': x.client_cost_cost?.value || '',
        'Status': x.client_status == 1 ? this.translate.instant('COMMON.STATUS.ACTIVE') : this.translate.instant('COMMON.STATUS.INACTIVE') || '',
      }));

    TableExportUtil.exportToExcel(exportData, 'excel');
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
      const foundIndex = this.clientService?.dataClientChange.value.findIndex(
        (x) => x._id === client._id
      );
      // for delete we use splice in order to remove single object from DataService
      if (foundIndex != null && this.clientService) {
        this.clientService.dataClientChange.value.splice(foundIndex, 1);
        this.refreshTable();
      }
    } else {
      showNotification(this.snackBar, data.message, 'error');
    }
  }

  async deleteClient(client: ClientList, is_delete: number) {
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
        }
      });
  }

  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    if (this.isDelete === 0) {
      if (this.is_quickbooks) {
        this.displayedColumns = ['select', 'client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'is_quickbooks', 'actions'];
      } else {
        this.displayedColumns = ['select', 'client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'actions'];
      }
    } else {
      if (this.is_quickbooks) {
        this.displayedColumns = ['client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'is_quickbooks', 'actions'];
      } else {
        this.displayedColumns = ['client_name', 'client_number', 'client_email', 'approver_id', 'client_cost_cost_id', 'client_status', 'actions'];
      }
    }
    this.refresh();
  }

  importFileAction() {
    let el: HTMLElement = this.OpenFilebox.nativeElement;
    el.click();
  }

  onFileChange(ev: any) {
    let that = this;
    let workBook: any;
    let jsonData = null;
    let header_;
    const reader = new FileReader();
    const file = ev.target.files[0];
    reader.onload = (event) => {
      const data = reader.result;
      workBook = XLSX.read(data, { type: 'binary' }) || '';
      jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
        const sheet = workBook.Sheets[name];
        initial[name] = XLSX.utils.sheet_to_json(sheet);
        let data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        header_ = data.shift();

        return initial;
      }, {});
      // const dataString = JSON.stringify(jsonData);
      // const keys_OLD = ["item_type_name", "packaging_name", "terms_name"];
      // if (JSON.stringify(keys_OLD.sort()) != JSON.stringify(header_.sort())) {
      //   that.sb.openSnackBar(that.Company_Equipment_File_Not_Match, "error");
      //   return;
      // } else {
      const formData_profle = new FormData();
      formData_profle.append('file', file);
      let apiurl = '';
      let that = this;

      apiurl = httpversion.PORTAL_V1 + httproutes.CHECK_IMPORT_CLIENT;


      that.uiSpinner.spin$.next(true);
      that.httpCall
        .httpPostCall(apiurl, formData_profle)
        .subscribe(function (params) {
          that.uiSpinner.spin$.next(false);
          if (params.status) {
            that.exitData = params;



            const dialogRef = that.dialog.open(ExitsDataListComponent, {
              width: '750px',
              height: '500px',
              data: that.exitData,
              disableClose: true,
            });

            dialogRef.afterClosed().subscribe((result: any) => {
              // this.getDataTerms();
              that.loadData();
            });
          } else {
            showNotification(that.snackBar, params.message, 'error');
            that.uiSpinner.spin$.next(false);
          }
        });
      // }
    };
    reader.readAsBinaryString(file);
  }
  downloadImport() {
    const dialogRef = this.dialog.open(ImportClientComponent, {
      width: '500px',
      data: {},
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      // this.getDataTerms();
      this.loadData();
    });
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
  constructor(
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
        case 'client_number':
          [propertyA, propertyB] = [a.client_number, b.client_number];
          break;
        case 'client_email':
          [propertyA, propertyB] = [a.client_email, b.client_email];
          break;
        case 'approver_id':
          [propertyA, propertyB] = [a.approver?.userfullname, b.approver?.userfullname];
          break;
        case 'client_cost_cost_id':
          [propertyA, propertyB] = [a.client_cost_cost?.value, b.client_cost_cost?.value];
          break;
        case 'client_status':
          [propertyA, propertyB] = [a.client_status, b.client_status,];
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
