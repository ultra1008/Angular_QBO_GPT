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
import { MailboxTable } from 'src/app/settings/settings.model';
import { SettingsService } from 'src/app/settings/settings.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';

@Component({
  selector: 'app-documents-listing',
  templateUrl: './documents-listing.component.html',
  styleUrls: ['./documents-listing.component.scss']
})
export class DocumentsListingComponent extends UnsubscribeOnDestroyAdapter
  implements OnInit {

  displayedColumns = [
    'email',
    'imap',
    'port',
    'time',
  ];
  mailboxService?: SettingsService;
  dataSource!: MailDataSource;
  selection = new SelectionModel<MailboxTable>(true, []);
  id?: number;
  isDelete = 0;
  titleMessage: string = '';

  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('filter', { static: true }) filter!: ElementRef;
  @ViewChild(MatMenuTrigger)
  contextMenu?: MatMenuTrigger;
  contextMenuPosition = { x: '0px', y: '0px' };

  constructor(
    public dialog: MatDialog,
    public SettingsService: SettingsService,
    public router: Router,
    private httpCall: HttpCall,
    public translate: TranslateService) {
    super();
  }

  ngOnInit() {
    this.loadData();
  }
  refresh() {
    this.loadData();
  }

  public loadData() {
    this.mailboxService = new SettingsService(this.httpCall);
    this.dataSource = new MailDataSource(
      this.mailboxService,
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
  onContextMenu(event: MouseEvent, item: MailboxTable) {
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

export class MailDataSource extends DataSource<MailboxTable> {
  filterChange = new BehaviorSubject('');
  get filter(): string {
    return this.filterChange.value;
  }
  set filter(filter: string) {
    this.filterChange.next(filter);
  }
  filteredData: MailboxTable[] = [];
  renderedData: MailboxTable[] = [];
  constructor(
    public mailboxService: SettingsService,
    public paginator: MatPaginator,
    public _sort: MatSort,
    public isDelete: number
  ) {
    super();
    // Reset to the first page when the user changes the filter.
    this.filterChange.subscribe(() => (this.paginator.pageIndex = 0));
  }
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<MailboxTable[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges = [
      this.mailboxService.dataChange,
      this._sort.sortChange,
      this.filterChange,
      this.paginator.page,
    ];
    this.mailboxService.getAllMailboxTable(this.isDelete);
    return merge(...displayDataChanges).pipe(
      map(() => {
        // Filter data
        this.filteredData = this.mailboxService.data
          .slice()
          .filter((mailboxTable: MailboxTable) => {
            const searchStr = (
              mailboxTable.email +
              mailboxTable.imap +
              mailboxTable.port +
              mailboxTable.time
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
  sortData(data: MailboxTable[]): MailboxTable[] {
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
        case 'email':
          [propertyA, propertyB] = [a.email, b.email];
          break;
        case 'imap':
          [propertyA, propertyB] = [a.imap, b.imap];
          break;
        case 'port':
          [propertyA, propertyB] = [a.port, b.port];
          break;
        case 'time':
          [propertyA, propertyB] = [a.time, b.time];
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