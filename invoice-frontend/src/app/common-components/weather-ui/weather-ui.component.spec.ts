import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeatherUiComponent } from './weather-ui.component';

describe('WeatherUiComponent', () => {
  let component: WeatherUiComponent;
  let fixture: ComponentFixture<WeatherUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WeatherUiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WeatherUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
