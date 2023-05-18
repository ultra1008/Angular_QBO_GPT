import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { icon } from 'src/consts/icon';

@Component({
  selector: 'app-qbdintegration',
  templateUrl: './qbdintegration.component.html',
  styleUrls: ['./qbdintegration.component.scss']
})
export class QbdintegrationComponent {

  qboIcon: any = icon.QUICKBOOKS_DESKTOP_LOGO;
  qboIntegrated: any;
  showConnectionButton: any;

  constructor(private router: Router) {

  }

  ngOnInit() {

  }

  back() {
    this.router.navigate(['/settings/integration']);
  }

  download() {

  }

  connect() {

  }
}
