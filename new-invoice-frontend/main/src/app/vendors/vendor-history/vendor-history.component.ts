import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VendorsService } from '../vendors.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';

@Component({
  selector: 'app-vendor-history',
  templateUrl: './vendor-history.component.html',
  styleUrls: ['./vendor-history.component.scss']
})
export class VendorHistoryComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  apiRoute = '';
  backRoute = '/vendors';
  start = 0;
  vendorHistory: any;
  historyLoading = true;

  constructor (private router: Router, public vendorService: VendorsService,) {
    super();
  }

  ngOnInit() {
    this.getVendorHistory();
  }

  async getVendorHistory() {
    const data = await this.vendorService.getVendorHistory({ start: this.start });
    if (data.status) {
      if (this.start == 0) {
        this.vendorHistory = data.data;
      } else {
        this.vendorHistory = this.vendorHistory.concat(data.data);
      }
      this.historyLoading = false;
    }
  }

  onScroll() {
    this.start++;
    this.getVendorHistory();
  }

  back() {
    this.router.navigate(['/vendors']);
  }

  setHeightStyles() {
    const styles = {
      height: '770px',
      // height: window.screen.height + "px",
      "overflow-y": "scroll",
    };
    return styles;
  }
}
