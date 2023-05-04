import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rolesettings',
  templateUrl: './rolesettings.component.html',
  styleUrls: ['./rolesettings.component.scss']
})
export class RolesettingsComponent {
  constructor(private router: Router) {

  }

  ngOnInit() {

  }


  back() {
    this.router.navigate(['/settings']);
  }
}
