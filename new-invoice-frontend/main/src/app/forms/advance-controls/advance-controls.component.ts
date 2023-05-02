import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export interface User {
  name: string;
}

@Component({
  selector: 'app-advance-controls',
  templateUrl: './advance-controls.component.html',
  styleUrls: ['./advance-controls.component.scss'],
})
export class AdvanceControlsComponent implements OnInit {
  hide = true;

  myControl = new UntypedFormControl();
  options: User[] = [{ name: 'Mary' }, { name: 'Shelley' }, { name: 'Igor' }];
  filteredOptions?: Observable<User[]>;

  breadscrums = [
    {
      title: 'Advance',
      items: ['Forms'],
      active: 'Advance',
    },
  ];

  constructor() {
    //constructor
  }

  ngOnInit() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => (typeof value === 'string' ? value : value.name)),
      map((name) => (name ? this._filter(name) : this.options.slice()))
    );
  }
  displayFn(user: User): string {
    return user && user.name ? user.name : '';
  }

  private _filter(name: string): User[] {
    const filterValue = name.toLowerCase();

    return this.options.filter(
      (option) => option.name.toLowerCase().indexOf(filterValue) === 0
    );
  }

  email = new UntypedFormControl('', [Validators.required, Validators.email]);

  getErrorMessage() {
    return this.email.hasError('required')
      ? 'You must enter a value'
      : this.email.hasError('email')
      ? 'Not a valid email'
      : '';
  }
}
