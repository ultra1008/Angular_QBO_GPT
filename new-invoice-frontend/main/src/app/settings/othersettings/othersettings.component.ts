import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-othersettings',
  templateUrl: './othersettings.component.html',
  styleUrls: ['./othersettings.component.scss']
})
export class OthersettingsComponent {
  constructor(private router: Router) {

  }

  ngOnInit() {

  }


  back() {
    this.router.navigate(['/settings']);
  }
}
