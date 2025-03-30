import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DarkModeHighchartsComponent } from './dark-mode-highcharts.component';

describe('DarkModeHighchartsComponent', () => {
  let component: DarkModeHighchartsComponent;
  let fixture: ComponentFixture<DarkModeHighchartsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DarkModeHighchartsComponent]
    });
    fixture = TestBed.createComponent(DarkModeHighchartsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
