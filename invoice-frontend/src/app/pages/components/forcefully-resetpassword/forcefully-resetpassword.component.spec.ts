import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForcefullyResetpasswordComponent } from './forcefully-resetpassword.component';

describe('ForcefullyResetpasswordComponent', () => {
  let component: ForcefullyResetpasswordComponent;
  let fixture: ComponentFixture<ForcefullyResetpasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ForcefullyResetpasswordComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ForcefullyResetpasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
