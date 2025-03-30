import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LightModeHighchartsThemeComponent } from './light-mode-highcharts-theme.component';

describe('LightModeHighchartsThemeComponent', () => {
  let component: LightModeHighchartsThemeComponent;
  let fixture: ComponentFixture<LightModeHighchartsThemeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LightModeHighchartsThemeComponent]
    });
    fixture = TestBed.createComponent(LightModeHighchartsThemeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
