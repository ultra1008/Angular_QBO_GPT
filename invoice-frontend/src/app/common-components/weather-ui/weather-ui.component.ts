import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Servicefoeweatherui } from './../../service/servicefoeweatherui.service';
import { MMDDYYYY, TimeFormat } from 'src/app/service/utils';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Snackbarservice } from 'src/app/service/snack-bar-service';
import { TranslateService } from '@ngx-translate/core';
import { configdata } from 'src/environments/configData';
import { localstorageconstants } from 'src/app/consts';

@Component({
  selector: 'app-weather-ui',
  templateUrl: './weather-ui.component.html',
  styleUrls: ['./weather-ui.component.css']
})

export class WeatherUiComponent implements OnInit {
  currLat: any;
  currLng: any;
  weatherReport: any = [];
  currantData: any;
  cityline: any;
  todaydate: any;
  showWeather: boolean = false;
  bg_image: String = "";
  hourly_array: any = [];
  daily_array: any = [];
  locallanguage: any;
  constructor (private http: HttpClient, public dialog: MatDialog, public snackbarservice: Snackbarservice,
    public servicefoeweatherui: Servicefoeweatherui, public translate: TranslateService) {
    var tmp_locallanguage = localStorage.getItem(localstorageconstants.LANGUAGE);
    this.locallanguage = tmp_locallanguage == "" || tmp_locallanguage == undefined || tmp_locallanguage == null ? configdata.fst_load_lang : tmp_locallanguage;
    this.translate.use(this.locallanguage);
    this.translate.stream(['']).subscribe((textarray) => {
      //this.getCurrentLocation();
    });
  }

  ngOnInit(): void {
    this.servicefoeweatherui.subscriberWeatger$.subscribe(data => {
      if (this.showWeather) {
        this.showWeather = false;
      } else {
        this.showWeather = true;
        if (this.weatherReport.length == 0) {
          this.getCurrentLocation();
        }
      }
      var that = this;
      setTimeout(function () {
        that.showWeather = false;
      }, configdata.WEATHERUISECOND);
    });

    //this.getCurrentLocation();
  }

  async getCurrentLocation() {
    if (navigator.geolocation) {
      await navigator.geolocation.getCurrentPosition(position => {
        this.currLat = position.coords.latitude;
        this.currLng = position.coords.longitude;

        this.getweather().subscribe(data => {
          this.weatherReport = [];
          this.currantData = data.daily[0];
          this.currantData.temp.min = Math.round(this.currantData.temp.min);
          this.currantData.temp.max = Math.round(this.currantData.temp.max);
          this.todaydate = MMDDYYYY(data.daily[0].dt);

          if (data.hourly[0].weather[0].id >= 200 && data.hourly[0].weather[0].id <= 232) {
            this.bg_image = "./assets/new_weather/bg_thunder-strom.jpg";
          } else if (data.hourly[0].weather[0].id >= 300 && data.hourly[0].weather[0].id <= 321) {
            this.bg_image = "./assets/new_weather/bg_shower-rain.jpg";
          }
          else if (data.hourly[0].weather[0].id >= 500 && data.hourly[0].weather[0].id <= 504) {
            this.bg_image = "./assets/new_weather/bg_shower-rain.jpg";
          } else if (data.hourly[0].weather[0].id >= 511 && data.hourly[0].weather[0].id <= 531) {
            this.bg_image = "./assets/new_weather/bg_shower-rain.jpg";
          }
          else if (data.hourly[0].weather[0].id >= 600 && data.hourly[0].weather[0].id <= 622) {
            this.bg_image = "./assets/new_weather/bg_snows.jpg";
          }
          else if (data.hourly[0].weather[0].id >= 701 && data.hourly[0].weather[0].id <= 781) {
            this.bg_image = "./assets/new_weather/bg_mist.jpg";
          }
          else if (data.hourly[0].weather[0].id == 800) {
            this.bg_image = "./assets/new_weather/bg_clear-sky.jpg";
          }
          else if (data.hourly[0].weather[0].id == 801) {
            this.bg_image = "./assets/new_weather/bg_few-clouds.jpg";
          }
          else if (data.hourly[0].weather[0].id == 802) {
            this.bg_image = "./assets/new_weather/bg_scattered-clouds.jpg";
          }
          else if (data.hourly[0].weather[0].id == 803) {
            this.bg_image = "./assets/new_weather/bg_broken-clouds.jpg";
          }
          else if (data.hourly[0].weather[0].id == 804) {
            this.bg_image = "./assets/new_weather/bg_broken-clouds.jpg";
          }
          else {
            this.bg_image = "./assets/new_weather/bg_shower-rain.jpg";
          }

          data.daily.forEach((element: any, index: any) => {
            var oneday = { url: "", day: "", temp: 0 };
            if (element.weather[0].id >= 200 && element.weather[0].id <= 232) {
              oneday.url = "./assets/new_weather/thunder-strom.png";
            } else if (element.weather[0].id >= 300 && element.weather[0].id <= 321) {
              oneday.url = "./assets/new_weather/shower-rain.png";
            }
            else if (element.weather[0].id >= 500 && element.weather[0].id <= 504) {
              oneday.url = "./assets/new_weather/few-clouds-rain.png";
            } else if (element.weather[0].id >= 511 && element.weather[0].id <= 531) {
              oneday.url = "./assets/new_weather/shower-rain.png";
            }
            else if (element.weather[0].id >= 600 && element.weather[0].id <= 622) {
              oneday.url = "./assets/new_weather/snows.png";
            }
            else if (element.weather[0].id >= 701 && element.weather[0].id <= 781) {
              oneday.url = "./assets/new_weather/mist.png";
            } else if (element.weather[0].id == 800) {
              oneday.url = "./assets/new_weather/clear-sky.png";
            }
            else if (element.weather[0].id == 801) {
              oneday.url = "./assets/new_weather/few-clouds.png";
            }
            else if (element.weather[0].id == 802) {
              oneday.url = "./assets/new_weather/scattered-clouds.png";
            }
            else if (element.weather[0].id == 803) {
              oneday.url = "./assets/new_weather/broken-clouds.png";
            }
            else if (element.weather[0].id == 804) {
              oneday.url = "./assets/new_weather/broken-clouds.png";
            }
            else {
              oneday.url = "./assets/new_weather/unknown.png";
            }
            let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
            if (portal_language == 'en') {
              oneday.day = configdata.weekdayshort[this.getDataValue(element.dt)];
            } else {
              oneday.day = configdata.WEEK_ARRAY_SHORT_ES[this.getDataValue(element.dt)];
            }

            oneday.temp = Math.round(element.temp.max);
            this.weatherReport.push(oneday);
            if (index + 1 === data.daily.length) {
              this.weatherReport.pop();
            }
          });
        });

        this.getcityweather().subscribe(datacity => {
          this.cityline = datacity.name + "," + datacity.sys.country;
        });
      });
    }
    else {
      alert("Geolocation is not supported by this browser.");
    }
  }

  getweather(): Observable<any> {
    var url = "https://api.openweathermap.org/data/2.5/onecall?";
    url += "lat=" + this.currLat + "&lon=" + this.currLng + "&";
    url += "exclude=current,minutely&appid=" + configdata.weatherAPIKEY + "&units=imperial";
    let that = this;
    return this.http.get(url).pipe(
      map((res: any) => {
        that.daily_array = res.daily;
        that.hourly_array = res.hourly;
        return res;
      }),
      catchError(this.handleError));
  }

  getcityweather(): Observable<any> {
    var url = "https://api.openweathermap.org/data/2.5/weather?";
    url += "lat=" + this.currLat + "&lon=" + this.currLng + "&";
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

  getDataValue(UNIX_timestamp: any) {
    var a = new Date(UNIX_timestamp * 1000);
    return a.getDay();
  }

  timeConverter(UNIX_timestamp: any) {
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var day_ = configdata.weekdayshort[a.getDay()];
    var time = day_ + "," + month + ' ' + date + ',' + year;
    return time;
  }

  openOneDay(index: any) {
    if (index == 0) {
      const dialogRef = this.dialog.open(WeatherUiForDayComponent, {
        data: { hourly_array: this.hourly_array, cityline: this.cityline, selected_day: this.daily_array[index] },
        panelClass: 'my-class'
      });
      dialogRef.afterClosed().subscribe(result => {
      });
    }
  }
}


@Component({
  selector: 'app-weather-day-ui',
  templateUrl: './weather-for-day.html',
  styleUrls: ['./weather-ui.component.css']
})
export class WeatherUiForDayComponent implements OnInit {
  bg_image: any = "./assets/new_weather/forpopup/raincopy.jpg";
  weatherReport: any = [];
  constructor (public dialogRef: MatDialogRef<WeatherUiForDayComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {

    for (let m = 0; m < data.hourly_array.length; m++) {
      if (data.hourly_array[0].weather[0].id >= 200 && data.hourly_array[0].weather[0].id <= 232) {
        this.bg_image = "./assets/new_weather/forpopup/thunderstrom.jpg";
      } else if (data.hourly_array[0].weather[0].id >= 300 && data.hourly_array[0].weather[0].id <= 321) {
        this.bg_image = "./assets/new_weather/forpopup/raincopy.jpg";
      }
      else if (data.hourly_array[0].weather[0].id >= 500 && data.hourly_array[0].weather[0].id <= 504) {
        this.bg_image = "./assets/new_weather/forpopup/raincopy.jpg";
      } else if (data.hourly_array[0].weather[0].id >= 511 && data.hourly_array[0].weather[0].id <= 531) {
        this.bg_image = "./assets/new_weather/forpopup/raincopy.jpg";
      }
      else if (data.hourly_array[0].weather[0].id >= 600 && data.hourly_array[0].weather[0].id <= 622) {
        this.bg_image = "./assets/new_weather/forpopup/snow.jpg";
      }
      else if (data.hourly_array[0].weather[0].id >= 701 && data.hourly_array[0].weather[0].id <= 781) {
        this.bg_image = "./assets/new_weather/forpopup/MISTcopy.jpg";
      }
      else if (data.hourly_array[0].weather[0].id == 800) {
        this.bg_image = "./assets/new_weather/forpopup/clear_sky.jpg";
      }
      else if (data.hourly_array[0].weather[0].id == 801) {
        this.bg_image = "./assets/new_weather/forpopup/sun_and_clouds.jpg";
      }
      else if (data.hourly_array[0].weather[0].id == 802) {
        this.bg_image = "./assets/new_weather/forpopup/sun_and_clouds.jpg";
      }
      else if (data.hourly_array[0].weather[0].id == 803) {
        this.bg_image = "./assets/new_weather/forpopup/dark_clouds.jpg";
      }
      else if (data.hourly_array[0].weather[0].id == 804) {
        this.bg_image = "./assets/new_weather/forpopup/dark_clouds.jpg";
      }
      else {
        this.bg_image = "./assets/new_weather/forpopup/raincopy.jpg";
      }

      let oneObject = { time: "", url: "", temp: 0 };
      oneObject.time = TimeFormat(data.hourly_array[m].dt);
      if (data.hourly_array[m].weather[0].id >= 200 && data.hourly_array[m].weather[0].id <= 232) {
        oneObject.url = "./assets/new_weather/thunder-strom.png";
      } else if (data.hourly_array[m].weather[0].id >= 300 && data.hourly_array[m].weather[0].id <= 321) {
        oneObject.url = "./assets/new_weather/shower-rain.png";
      }
      else if (data.hourly_array[m].weather[0].id >= 500 && data.hourly_array[m].weather[0].id <= 504) {
        oneObject.url = "./assets/new_weather/few-clouds-rain.png";
      } else if (data.hourly_array[m].weather[0].id >= 511 && data.hourly_array[m].weather[0].id <= 531) {
        oneObject.url = "./assets/new_weather/shower-rain.png";
      }
      else if (data.hourly_array[m].weather[0].id >= 600 && data.hourly_array[m].weather[0].id <= 622) {
        oneObject.url = "./assets/new_weather/snows.png";
      }
      else if (data.hourly_array[m].weather[0].id >= 701 && data.hourly_array[m].weather[0].id <= 781) {
        oneObject.url = "./assets/new_weather/mist.png";
      } else if (data.hourly_array[m].weather[0].id == 800) {
        oneObject.url = "./assets/new_weather/clear-sky.png";
      }
      else if (data.hourly_array[m].weather[0].id == 801) {
        oneObject.url = "./assets/new_weather/few-clouds.png";
      }
      else if (data.hourly_array[m].weather[0].id == 802) {
        oneObject.url = "./assets/new_weather/scattered-clouds.png";
      }
      else if (data.hourly_array[m].weather[0].id == 803) {
        oneObject.url = "./assets/new_weather/broken-clouds.png";
      }
      else if (data.hourly_array[m].weather[0].id == 804) {
        oneObject.url = "./assets/new_weather/broken-clouds.png";
      }
      else {
        oneObject.url = "./assets/new_weather/unknown.png";
      }
      oneObject.temp = Math.round(data.hourly_array[m].temp);
      this.weatherReport.push(oneObject);
    }
  }
  ngOnInit() {

  }

  month_day(data: any) {
    let tmp_data = new Date(data * 1000);
    let portal_language = localStorage.getItem(localstorageconstants.LANGUAGE);
    var temp: string;
    if (portal_language == 'en') {
      temp = configdata.WEEK_ARRAY[tmp_data.getDay()] + " - " + configdata.MONTHS_ARRAY[tmp_data.getMonth()] + " " + tmp_data.getDate();
    } else {
      temp = configdata.WEEK_ARRAY_ES[tmp_data.getDay()] + " - " + configdata.MONTH_ARRAY_ES[tmp_data.getMonth()] + " " + tmp_data.getDate();
    }
    return temp;
  }

  convertToTime(date: any) {
    return TimeFormat(date);
  }
}