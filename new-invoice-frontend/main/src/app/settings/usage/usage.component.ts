import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { DataSource, SelectionModel } from '@angular/cdk/collections';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { CostCodeDataSource } from '../costcode/costcode.component';
import { CostCodeTable, UsageTable } from '../settings.model';
import { SettingsService } from '../settings.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/services/httpcall.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BehaviorSubject, Observable, fromEvent, map, merge, of } from 'rxjs';
import { httproutes, httpversion } from 'src/consts/httproutes';

@Component({
  selector: 'app-usage',
  templateUrl: './usage.component.html',
  styleUrls: ['./usage.component.scss'],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', visibility: 'hidden' })
      ),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class UsageComponent {
  displayedColumns = ['position'];
  dataSource = new ExampleDataSource();
  AllUsage: any;

  isExpansionDetailRow = (i: number, row: Object) =>
    row.hasOwnProperty('detailRow');
  expandedElement: any;

  constructor(
    public SettingsService: SettingsService,
    public router: Router,
    public translate: TranslateService,
    public httpCall: HttpCall
  ) {
    let that = this;
    this.getusagedata();
    console.log('console.log data', that.AllUsage);
  }
  back() {
    this.router.navigate(['/settings']);
  }

  ngOnInit() {
    console.log('loggggg', this.AllUsage);
    this.getusagedata();
  }

  async getusagedata() {
    let that = this;
    this.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_SETTING_ROLES_ALL)
      .subscribe(function (data: { status: any; data: any }) {
        console.log('data', data);
        if (data.status) {
          that.AllUsage = data.data;
          console.log('data1', that.AllUsage);
        }
      });
  }
}

export interface Element {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

// this.httpCall
//   .httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_SETTING_ROLES_ALL)
//   .subscribe(function (data: { status: any; data: any }) {
//     console.log('data', data);
//     if (data.status) {
//       this.AllUsage = data.data;
//       console.log('data1', this.AllUsage);
//     }
//   });

const data: Element[] = [
  { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
  { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
  { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
  { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
  { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
  { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
];

/**
 * Data source to provide what data should be rendered in the table. The observable provided
 * in connect should emit exactly the data that should be rendered by the table. If the data is
 * altered, the observable should emit that new set of data on the stream. In our case here,
 * we return a stream that contains only one set of data that doesn't change.
 */
export class ExampleDataSource extends DataSource<any> {
  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<Element[]> {
    const rows: any = [];
    data.forEach((element) => rows.push(element, { detailRow: true, element }));
    console.log(rows);
    return of(rows);
  }

  disconnect() {}
}
