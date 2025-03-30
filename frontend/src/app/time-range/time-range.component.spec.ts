import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeRangeComponent } from './time-range.component';

describe('TimeRangeComponent', () => {
  let component: TimeRangeComponent;
  let fixture: ComponentFixture<TimeRangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeRangeComponent]
    });
    fixture = TestBed.createComponent(TimeRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
