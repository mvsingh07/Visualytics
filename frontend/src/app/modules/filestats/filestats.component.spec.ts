import { ComponentFixture, TestBed } from '@angular/core/testing';

import { filestatsComponent } from './filestats.component';

describe('FilestatsComponent', () => {
  let component: filestatsComponent;
  let fixture: ComponentFixture<filestatsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [filestatsComponent]
    });
    fixture = TestBed.createComponent(filestatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
