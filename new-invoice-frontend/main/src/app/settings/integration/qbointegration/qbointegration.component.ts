import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { icon } from 'src/consts/icon';

@Component({
  selector: 'app-qbointegration',
  templateUrl: './qbointegration.component.html',
  styleUrls: ['./qbointegration.component.scss']
})
export class QbointegrationComponent {

  qboIcon: any = icon.QUICKBOOKS_ONLINE_LOGO;
  qboIntegrated: any;
  showConnectionButton: any;

  constructor(private router: Router) {

  }

  ngOnInit() {

  }

  back() {
    this.router.navigate(['/settings/integration']);
  }

  connect() {

  }
}
