import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-smtp',
  templateUrl: './smtp.component.html',
  styleUrls: ['./smtp.component.scss']
})
export class SmtpComponent {
  constructor(private router: Router) {

  }

  ngOnInit() {

  }


  back() {
    this.router.navigate(['/settings']);
  }
}
