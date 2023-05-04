import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-alerts',
  templateUrl: './alerts.component.html',
  styleUrls: ['./alerts.component.scss']
})
export class AlertsComponent {
  constructor(private router: Router) {

  }

  ngOnInit() {

  }


  back() {
    this.router.navigate(['/settings']);
  }
}
