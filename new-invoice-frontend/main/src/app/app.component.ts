import { Component } from '@angular/core';
import { Event, Router, NavigationStart, NavigationEnd } from '@angular/router';

import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import Swal from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  currentUrl!: string;
  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date;
  title = 'angular-idle-timeout';

  swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      denyButton: 'btn btn-warning',
      cancelButton: 'btn btn-danger',
    },
    buttonsStyling: false,
  });

  constructor (public translate: TranslateService, public _router: Router, private idle: Idle, private keepalive: Keepalive) {
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('en');
    this._router.events.subscribe((routerEvent: Event) => {
      if (routerEvent instanceof NavigationStart) {
        this.currentUrl = routerEvent.url.substring(
          routerEvent.url.lastIndexOf('/') + 1
        );
      }
      if (routerEvent instanceof NavigationEnd) {
        /* empty */
      }
      window.scrollTo(0, 0);
    });

    // sets an idle timeout of 5 seconds, for testing purposes.
    idle.setIdle(1800); // 60 x 30 = 30 min
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    idle.setTimeout(5);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => {
      this.idleState = 'No longer idle.';
      console.log(this.idleState);
      this.reset();
    });

    idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      console.log(this.idleState);
      this.swalWithBootstrapButtons.close();
      // Open User Lock screen
      this._router.navigate(['/authentication/locked']);
    });

    idle.onIdleStart.subscribe(() => {
      this.idleState = 'You\'ve gone idle!';
      console.log(this.idleState);

      //display diaglog here
      this.swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: "You have been inactive for " + 5 + " minutes, your session is about to end due to inactivity.",
        html: "As a security precaution, if there is no additional activity in your ROVUK session, the session will end and you will be brought to the login page.</br></br>If you are still working please click OK to continue.",
        icon: 'warning',
        showCancelButton: true,
        // confirmButtonColor: '#3085d6',
        // cancelButtonColor: '#d33',
        confirmButtonText: 'Logout',
        denyButtonText: "Lock screen",
        showDenyButton: true,
        allowOutsideClick: false
      }).then((result) => {
        if (result.value) {
          console.log('Logout press');
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          console.log('Ok press');
          this.swalWithBootstrapButtons.close();
        }
      });
    });

    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will time out in ' + countdown + ' seconds!';
      console.log(this.idleState);
    });

    // sets the ping interval to 15 seconds
    keepalive.interval(15);

    keepalive.onPing.subscribe(() => this.lastPing = new Date());

    this.reset();
  }

  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }
}
