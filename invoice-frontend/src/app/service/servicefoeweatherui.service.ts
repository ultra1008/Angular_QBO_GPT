import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { configdata } from 'src/environments/configData';

@Injectable({ providedIn: 'root' })

export class Servicefoeweatherui {
  observer = new Subject();
  public subscriberWeatger$ = this.observer.asObservable();
  currLat: any;
  currLng: any;

  constructor(private http: HttpClient) { }
  emitData(data: any) {
    this.observer.next(data);
  }

  public getweather(lat: any, lng_: any): Observable<any> {
    var url = "https://api.openweathermap.org/data/2.5/onecall?";
    url += "lat=" + lat + "&lon=" + lng_ + "&";
    url += "exclude=current,hourly,minutely&appid=" + configdata.weatherAPIKEY + "&units=imperial";
    return this.http.get(url).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }

  public getcityweather(lat: any, lng_: any): Observable<any> {
    var url = "https://api.openweathermap.org/data/2.5/weather?";
    url += "lat=" + lat + "&lon=" + lng_ + "&";
    url += "exclude=current,hourly,minutely&appid=" + configdata.weatherAPIKEY + "&units=imperial";

    return this.http.get(url).pipe(
      map((res) => {
        return res;
      }),
      catchError(this.handleError));
  }
  handleError(error: any) {
    if (error.error instanceof Error) {

      let errMessage = error.error.message;
      return throwError(errMessage);
    }
    return throwError(error);
  }
}