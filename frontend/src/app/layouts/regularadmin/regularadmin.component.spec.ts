import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegularadminComponent } from './regularadmin.component';

describe('RegularadminComponent', () => {
  let component: RegularadminComponent;
  let fixture: ComponentFixture<RegularadminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RegularadminComponent]
    });
    fixture = TestBed.createComponent(RegularadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
