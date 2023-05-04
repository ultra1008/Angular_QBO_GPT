import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-integration',
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent {
  constructor(private router: Router) {

  }

  ngOnInit() {

  }


  back() {
    this.router.navigate(['/settings']);
  }
}
