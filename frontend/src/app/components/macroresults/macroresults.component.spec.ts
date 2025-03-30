import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MacroresultsComponent } from './macroresults.component';

describe('MacroresultsComponent', () => {
  let component: MacroresultsComponent;
  let fixture: ComponentFixture<MacroresultsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MacroresultsComponent]
    });
    fixture = TestBed.createComponent(MacroresultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
