import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-quickbooks-authorization',
  templateUrl: './quickbooks-authorization.component.html',
  styleUrls: ['./quickbooks-authorization.component.scss']
})
export class QuickbooksAuthorizationComponent {

  constructor(
    private readonly route: ActivatedRoute,
    private readonly http: HttpClient
  ) { }

  public step!: number;

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params && params['code']) {
        this.step = 2;
      } else {
        this.step = 1;
      }
    });
  }

  public loadClients!: number;
  public loadInvoices!: number;

  public synchronizeQuickbooks() {
    this.step = 3;

    this.http
      .get("http://localhost:4201/webapi/quickbooks/clients", {
        reportProgress: true,
        observe: "events",
      })

      .subscribe((res) => {
        console.log("my res", res);

        this.loadClients = 0;
        if (res.type === HttpEventType.DownloadProgress) {
          // this.loadClients = Math.round((100 * res.loaded) / res.total);
        }

        if (res.type === HttpEventType.Response) {
          this.loadClients = 100;
          this.loadInvoices = 0
        }
      });
  }

}
