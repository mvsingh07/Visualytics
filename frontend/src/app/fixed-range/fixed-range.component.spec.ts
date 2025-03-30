import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedRangeComponent } from './fixed-range.component';

describe('FixedRangeComponent', () => {
  let component: FixedRangeComponent;
  let fixture: ComponentFixture<FixedRangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FixedRangeComponent]
    });
    fixture = TestBed.createComponent(FixedRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
