import { Component, OnInit, ViewChild } from '@angular/core';
import { DatatableComponent, SortType } from '@swimlane/ngx-datatable';
import {
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { NgxDatable } from './ngx-datatable.model';
@Component({
  selector: 'app-ngx-datatable',
  templateUrl: './ngx-datatable.component.html',
  styleUrls: ['./ngx-datatable.component.scss'],
})
export class NgxDatatableComponent implements OnInit {
  @ViewChild(DatatableComponent, { static: false }) table!: DatatableComponent;
  rows = [];
  selectedRowData?: selectRowInterface;
  newUserImg = 'assets/images/user/user1.jpg';
  data: NgxDatable[] = [];
  filteredData: NgxDatable[] = [];
  editForm: UntypedFormGroup;
  register?: UntypedFormGroup;
  selectedOption?: string;
  SortType = SortType;
  columns = [
    { name: 'First Name' },
    { name: 'Last Name' },
    { name: 'Gender' },
    { name: 'Phone' },
    { name: 'Email' },
    { name: 'Address' },
  ];
  genders = [
    { id: '1', value: 'Male' },
    { id: '2', value: 'Female' },
  ];
  foods = [
    { value: 'steak-0', viewValue: 'Steak' },
    { value: 'pizza-1', viewValue: 'Pizza' },
    { value: 'tacos-2', viewValue: 'Tacos' },
  ];
  // Table 2
  tb2columns = [
    { name: 'First Name' },
    { name: 'Last Name' },
    { name: 'Address' },
  ];
  tb2data: NgxDatable[] = [];
  tb2filteredData: NgxDatable[] = [];
  @ViewChild(DatatableComponent, { static: false }) table2!: DatatableComponent;
  breadscrums = [
    {
      title: 'ngx-datatable',
      items: ['Tables'],
      active: 'ngx-datatable',
    },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private _snackBar: MatSnackBar // private modalService: NgbModal
  ) {
    this.editForm = this.fb.group({
      id: new UntypedFormControl(),
      img: new UntypedFormControl(),
      firstName: new UntypedFormControl(),
      lastName: new UntypedFormControl(),
      phone: new UntypedFormControl(),
      email: new UntypedFormControl(),
      address: new UntypedFormControl(),
    });
  }
  ngOnInit() {
    this.fetch((data: NgxDatable[]) => {
      this.data = data;
      this.filteredData = data;
    });
    // Table 2
    this.tb2fetch((data: NgxDatable[]) => {
      this.tb2data = data;
      this.tb2filteredData = data;
    });
    this.register = this.fb.group({
      id: [''],
      img: [''],
      firstName: ['', [Validators.required, Validators.pattern('[a-zA-Z]+')]],
      lastName: [''],
      phone: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.minLength(5)],
      ],
      address: [''],
    });
  }
  fetch(cb: (i: NgxDatable[]) => void) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/adv-tbl-data.json');
    req.onload = () => {
      const data = JSON.parse(req.response);
      cb(data);
    };
    req.send();
  }
  // Table 2
  tb2fetch(cb: (i: NgxDatable[]) => void) {
    const req = new XMLHttpRequest();
    req.open('GET', 'assets/data/ngx-data.json');
    req.onload = () => {
      const data = JSON.parse(req.response);
      cb(data);
    };
    req.send();
  }
  // Table 2
  tb2filterDatatable(event: Event) {
    // get the value of the key pressed and make it lowercase
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    // get the amount of columns in the table
    const colsAmt = this.tb2columns.length;
    // get the key names of each column in the dataset
    // const keys = Object.keys(this.tb2filteredData[0]);
    // assign filtered matches to the active datatable
    this.tb2data = this.tb2filteredData.filter(function (item: NgxDatable) {
      // iterate through each row's column data
      for (let i = 0; i < colsAmt; i++) {
        // check for a match
        if (
          item.firstName.toString().toLowerCase().indexOf(val) !== -1 ||
          !val
        ) {
          // found match, return true to add to result set
          return true;
        }
      }
      return false;
    });
    // whenever the filter changes, always go back to the first page
    this.table2.offset = 0;
  }

  deleteRow(row: NgxDatable) {
    this.data = this.arrayRemove(this.data, row.id);
    this.showNotification(
      'bg-red',
      'Delete Record Successfully',
      'bottom',
      'right'
    );
  }
  arrayRemove(array: NgxDatable[], id: number) {
    return array.filter(function (element: NgxDatable) {
      return element.id != id;
    });
  }
  filterDatatable(event: Event) {
    const val = (event.target as HTMLInputElement).value.toLowerCase();
    const colsAmt = this.columns.length;

    this.data = this.filteredData.filter(function (item: NgxDatable) {
      for (let i = 0; i < colsAmt; i++) {
        if (
          item.firstName.toString().toLowerCase().indexOf(val) !== -1 ||
          !val
        ) {
          // found match, return true to add to result set
          return true;
        }
      }
      return false;
    });
    // whenever the filter changes, always go back to the first page
    this.table.offset = 0;
  }
  getId(min: number, max: number) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  openSnackBar(message: string) {
    this._snackBar.open(message, '', {
      duration: 2000,
      verticalPosition: 'bottom',
      horizontalPosition: 'right',
      panelClass: ['bg-red'],
    });
  }
  showNotification(
    colorName: string,
    text: string,
    placementFrom: MatSnackBarVerticalPosition,
    placementAlign: MatSnackBarHorizontalPosition
  ) {
    this._snackBar.open(text, '', {
      duration: 2000,
      verticalPosition: placementFrom,
      horizontalPosition: placementAlign,
      panelClass: colorName,
    });
  }
}
export interface selectRowInterface {
  img: string;
  firstName: string;
  lastName: string;
}
