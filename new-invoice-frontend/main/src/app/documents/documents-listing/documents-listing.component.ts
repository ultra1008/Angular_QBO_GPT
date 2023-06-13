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
import { httproutes, httpversion } from 'src/consts/httproutes';
import { WEB_ROUTES } from 'src/consts/routes';

@Component({
  selector: 'app-documents-listing',
  templateUrl: './documents-listing.component.html',
  styleUrls: ['./documents-listing.component.scss']
})
export class DocumentsListingComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  displayedColumns = ['document_type', 'po_no', 'invoice_no', 'vendor_name', 'updated_by', 'updated_at', 'actions'];
  documentsServices?: DocumentsService;
  dataSource!: DocumentDataSource;
  selection = new SelectionModel<DocumentTable>(true, []);
  id?: number;
  isDelete = 0;
  step_index = 0;
  titleMessage = '';
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
    if (this.router.getCurrentNavigation()?.extras.state) {
      this.step_index = Number(this.router.getCurrentNavigation()?.extras.state?.['value']);
    }
  }

  ngOnInit() {
    if (this.step_index == 0) {
      this.loadData(httpversion.PORTAL_V1 + httproutes.GET_ORPHAN_AP_PO);
    } else if (this.step_index == 1) {
      this.loadData(httpversion.PORTAL_V1 + httproutes.GET_ORPHAN_AP_PACKLING_SLIP);
    } else if (this.step_index == 2) {
      this.loadData(httpversion.PORTAL_V1 + httproutes.GET_ORPHAN_AP_RECEVING_SLIP);
    } else if (this.step_index == 3) {
      this.loadData(httpversion.PORTAL_V1 + httproutes.GET_ORPHAN_AP_QUOTE);
    } else if (this.step_index == 4) {
      this.loadData(httpversion.PORTAL_V1 + httproutes.GET_AP_OTHER_DOCUMENT);
    }
  }
  refresh() {
    this.ngOnInit();
  }

  public loadData(url: string) {
    this.documentsServices = new DocumentsService(this.httpCall);
    this.dataSource = new DocumentDataSource(
      this.documentsServices,
      this.paginator,
      this.sort,
      url,
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
    this.step_index = $event.index;
    this.ngOnInit();
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

  openEditDocument(document: DocumentTable) {
    if (document.document_type == '') {
      this.router.navigate([WEB_ROUTES.DOCUMENT_UNKNOWN_TYPE], { queryParams: { _id: document._id } });
    } else {
      this.router.navigate([WEB_ROUTES.INVOICE_VIEW_DOCUMENT], { queryParams: { _id: document._id, document: document.document_type, from: 'document' } });
    }
  }

  setDocumentType(documentType: string) {
    let document_type = '';
    if (documentType !== '') {
      const foundIndex = configData.DOCUMENT_TYPE_LIST.findIndex((x: any) => x.key === documentType);
      if (foundIndex != null) {
        document_type = configData.DOCUMENT_TYPE_LIST[foundIndex].name;
      }
    }
    return document_type;
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
    public documentsService: DocumentsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public apiUrl: string,
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<DocumentTable[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.documentsService.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.documentsService.getDocumentTable(this.apiUrl);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.documentsService.data
          .slice()
          .filter((response: DocumentTable) => {
            const searchStr = (
              response.document_type +
              response.po_no +
              response.invoice_no +
              response.vendor_data?.vendor_name +
              response.updated_by +
              response.updated_at
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
          [propertyA, propertyB] = [a.vendor_data?.vendor_name, b.vendor_data?.vendor_name];
          break;
        case 'updated_by':
          [propertyA, propertyB] = [a.updated_by.userfullname, b.updated_by.userfullname];
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