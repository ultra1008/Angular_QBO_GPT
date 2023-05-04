import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employeesettings',
  templateUrl: './employeesettings.component.html',
  styleUrls: ['./employeesettings.component.scss']
})
export class EmployeesettingsComponent {
  constructor(private router: Router) {

  }

  ngOnInit() {

  }


  back() {
    this.router.navigate(['/settings']);
  }
}
