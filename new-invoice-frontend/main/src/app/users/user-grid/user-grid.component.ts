import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { HttpCall } from 'src/app/services/httpcall.service';
import { UnsubscribeOnDestroyAdapter } from 'src/app/shared/UnsubscribeOnDestroyAdapter';
import { localstorageconstants } from 'src/consts/localstorageconstants';
import { WEB_ROUTES } from 'src/consts/routes';
import { UserService } from '../user.service';
import { UserDataSource } from '../users-listing/users-listing.component';
import { fromEvent } from 'rxjs';

@Component({
  selector: 'app-user-grid',
  templateUrl: './user-grid.component.html',
  styleUrls: ['./user-grid.component.scss']
})
export class UserGridComponent extends UnsubscribeOnDestroyAdapter implements OnInit {
  isDelete = 0;
  userList: any = [];
  dataSource!: UserDataSource;
  @ViewChild('filter', { static: true }) filter!: ElementRef;

  constructor(
    public httpClient: HttpClient, private httpCall: HttpCall,
    public dialog: MatDialog, public userService: UserService,
    private snackBar: MatSnackBar, private router: Router,
  ) {
    super();
  }

  ngOnInit() {
    this.getUser();
  }

  async getUser() {
    const data = await this.userService.getUser(this.isDelete);
    this.userList = data;
  }
  gotoArchiveUnarchive() {
    this.isDelete = this.isDelete == 1 ? 0 : 1;
    this.getUser();

  }


  gotoUser() {
    console.log("call");
    localStorage.setItem(localstorageconstants.USER_DISPLAY, 'list');
    this.router.navigate([WEB_ROUTES.USER]);
  }
}
