import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-documentview',
  templateUrl: './documentview.component.html',
  styleUrls: ['./documentview.component.scss']
})
export class DocumentviewComponent {
  constructor(private router: Router) {

  }

  ngOnInit() {

  }


  back() {
    this.router.navigate(['/settings']);
  }
}
