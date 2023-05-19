import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SettingsService } from '../settings.service';
import { TranslateService } from '@ngx-translate/core';
import { HttpCall } from 'src/app/services/httpcall.service';
import { httproutes, httpversion } from 'src/consts/httproutes';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { async } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UiSpinnerService } from 'src/app/services/ui-spinner.service';

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
  // displayedColumns = ['year'];
  dataSource!: any;
  AllUsage: any;
  usageinfo: FormGroup;

  columnsToDisplay = ['year'];
  expandedElement!: Element;

  tmp_arr: any = [
    {
      name: 'Parth',
      facility_no: 'TC1234',
      Amount: '124.45',
    },
    {
      name: 'Parth1',
      facility_no: 'TC123',
      Amount: '123.45',
    },
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  isExpansionDetailRow = (i: number, row: Object) =>
    row.hasOwnProperty('detailRow');
  // expandedElement!: Element;

  constructor(
    public SettingsService: SettingsService,
    public router: Router,
    public translate: TranslateService,
    public httpCall: HttpCall,
    private formBuilder: FormBuilder,
    public uiSpinner: UiSpinnerService
  ) {
    this.usageinfo = this.formBuilder.group({
      totalSuervisor: [{ value: '' }],
      bucket_size: [{ value: '' }],
    });
    let that = this;
    // this.getusagedata();
    that.getcompanyusage();
  }
  back() {
    this.router.navigate(['/settings']);
  }
  myFunc = (i: number, row: Object) => {
    console.log(row.hasOwnProperty('position'));
    row.hasOwnProperty('position');
  };
  ngOnInit() {
    this.getcompanyusage();
    this.getusagedata();

    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource = new MatTableDataSource(this.AllUsage.slice());
  }

  async getcompanyusage() {
    let that = this;
    that.uiSpinner.spin$.next(true);
    that.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_SETTING_USEAGE)
      .subscribe(function (params) {
        if (params.status) {
          that.uiSpinner.spin$.next(false);
          that.usageinfo = that.formBuilder.group({
            totalSuervisor: [params.data.totalSuervisor],
            bucket_size: [params.data.bucket_size],
          });
        }
      });
  }

  async getusagedata() {
    let that = this;
    that.httpCall
      .httpGetCall(httpversion.PORTAL_V1 + httproutes.USAGE_DATA_TABLE)
      .subscribe(function (params) {
        if (params.length > 0) {
          that.AllUsage = [];
          for (let i = 0; i < params.length; i++) {
            that.AllUsage.push({
              year: params[i].year,
              // invoice_expense: params.data[i].invoice_expense,
              // invoice_forms: params.data[i].invoice_forms,
              // packing_slip_expense: params.data[i].packing_slip_expense,
              // packing_slip_forms: params.data[i].packing_slip_forms,
              // po_expense: params.data[i].po_expense,
              // po_forms: params.data[i].po_forms,
              // quote_expense: params.data[i].quote_expense,
              // quote_forms: params.data[i].quote_forms,
            });
            console.log('daafsAFSAJsd', that.AllUsage);
          }

          that.dataSource = new MatTableDataSource(that.AllUsage);

          // that.uiSpinner.spin$.next(false);
        }
      });
  }
}
// export interface Element {
//   year: number;
// }

// this.httpCall
//   .httpGetCall(httpversion.PORTAL_V1 + httproutes.PORTAL_SETTING_ROLES_ALL)
//   .subscribe(function (data: { status: any; data: any }) {
//     console.log('data', data);
//     if (data.status) {
//       this.AllUsage = data.data;
//       console.log('data1', this.AllUsage);
//     }
//   });

// const data: Element[] = [
//   { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
//   { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
//   { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
//   { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
//   { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
//   { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
// ];

/**
 * Data source to provide what data should be rendered in the table. The observable provided
 * in connect should emit exactly the data that should be rendered by the table. If the data is
 * altered, the observable should emit that new set of data on the stream. In our case here,
 * we return a stream that contains only one set of data that doesn't change.
 */
// export class ExampleDataSource extends DataSource<any> {
//   /** Connect function called by the table to retrieve one stream containing the data to render. */
//   connect(): Observable<Element[]> {
//     const rows: any = [];
//     data.forEach((element) => rows.push(element, { detailRow: true, element }));
//     console.log(rows);
//     return of(rows);
//   }

//   disconnect() {}
// }

export interface Element {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

// const ELEMENT_DATA: Element[] = [
//   { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
//   { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
//   { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
//   { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
//   { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
//   { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
//   { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
//   { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
//   { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
//   { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
//   { position: 11, name: 'Sodium', weight: 22.9897, symbol: 'Na' },
//   { position: 12, name: 'Magnesium', weight: 24.305, symbol: 'Mg' },
//   { position: 13, name: 'Aluminum', weight: 26.9815, symbol: 'Al' },
//   { position: 14, name: 'Silicon', weight: 28.0855, symbol: 'Si' },
//   { position: 15, name: 'Phosphorus', weight: 30.9738, symbol: 'P' },
//   { position: 16, name: 'Sulfur', weight: 32.065, symbol: 'S' },
//   { position: 17, name: 'Chlorine', weight: 35.453, symbol: 'Cl' },
//   { position: 18, name: 'Argon', weight: 39.948, symbol: 'Ar' },
//   { position: 19, name: 'Potassium', weight: 39.0983, symbol: 'K' },
//   { position: 20, name: 'Calcium', weight: 40.078, symbol: 'Ca' },
// ];
