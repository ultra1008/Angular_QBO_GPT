import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { map, merge } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { DocumentTable } from '../documents.model';
import { DocumentsService } from '../documents.service';
import { MMDDYYYY } from 'src/consts/utils';
import { configData } from 'src/environments/configData';

@Component({
  selector: 'app-documents-listing',
  templateUrl: './documents-listing.component.html',
  styleUrls: ['./documents-listing.component.scss']
})
export class DocumentsListingComponent extends UnsubscribeOnDestroyAdapter
  implements OnInit {

  displayedColumns = [
    'document_type',
    'po_no',
    'invoice_no',
    'vendor_name',
    'updated_by',
    'updated_at',
  ];
  DocumentsServices?: DocumentsService;
  dataSource!: DocumentDataSource;
  selection = new SelectionModel<DocumentTable>(true, []);
  id?: number;
  isDelete = 0;
  step_index = 0;
  titleMessage = '';
  showTable = true;
  tab_Array: any = ['INVOICE', 'PURCHASE_ORDER', 'PACKING_SLIP', 'RECEIVING_SLIP', 'QUOTE', 'Other', 'Delete'];
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };
  documentTypes = configData.DOCUMENT_TYPES;

  constructor (
    public dialog: MatDialog,
    public DocumentsService: DocumentsService,
    public router: Router,
    private httpCall: HttpCall,
    public translate: TranslateService) {
    super();
  }

  ngOnInit() {
    this.loadData();
  }
  refresh() {
    this.showTable = false;
    this.loadData();
    this.showTable = true;
  }
  tmp_date(epoch: any) {
    return MMDDYYYY(epoch);
  }


  public loadData() {

    console.log("this.t", this.tab_Array[this.step_index]);
    if (this.step_index == this.tab_Array.length - 1) {
      // this.isDelete = 1;
    } else {
      // this.isDelete = 0;
      // this.document_type = this.tab_Array[this.step_index];
    }
    this.isDelete = 1;
    this.DocumentsServices = new DocumentsService(this.httpCall);
    this.dataSource = new DocumentDataSource(
      this.DocumentsServices,
      this.paginator,
      this.sort,
      this.isDelete,
      this.tab_Array[this.step_index]
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
  onTabChanged($event: any) {
    // this.rerenderfunc();
    this.loadData();
  }

  back() {
    this.router.navigate(['/settings']);
  }
  // context menu
  onContextMenu(event: MouseEvent, item: DocumentTable) {
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

export class DocumentDataSource extends DataSource<DocumentTable> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: DocumentTable[] = [];
  renderedData: DocumentTable[] = [];
  constructor (
    public DocumentsService: DocumentsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number,
    public tab_Array: string,

  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentTable[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.DocumentsService.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.DocumentsService.getDocumentTable(this.isDelete, this.tab_Array);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.DocumentsService.data
          .slice()
          .filter((DocumentTable: DocumentTable) => {
            const searchStr = (
              DocumentTable.document_type +
              DocumentTable.po_no +
              DocumentTable.invoice_no +
              DocumentTable.vendor_name +
              DocumentTable.updated_by +
              DocumentTable.updated_at
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
  sortData(data: DocumentTable[]): DocumentTable[] {
    if (!this._sort.active || this._sort.direction === '') {
      return data;
    }
    return data.sort((a, b) => {
      let propertyA: number | string = '';
      let propertyB: number | string = '';
      switch (this._sort.active) {
        case 'document_type':
          [propertyA, propertyB] = [a.document_type, b.document_type];
          break;
        case 'po_no':
          [propertyA, propertyB] = [a.po_no, b.po_no];
          break;
        case 'invoice_no':
          [propertyA, propertyB] = [a.invoice_no, b.invoice_no];
          break;
        case 'vendor_name':
          [propertyA, propertyB] = [a.vendor_name, b.vendor_name];
          break;
        case 'updated_by':
          [propertyA, propertyB] = [a.updated_by, b.updated_by];
          break;
        case 'updated_at':
          [propertyA, propertyB] = [a.updated_at, b.updated_at];
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

function MMDDYYYY_formet(epoch: any) {
  throw new Error('Function not implemented.');
}
