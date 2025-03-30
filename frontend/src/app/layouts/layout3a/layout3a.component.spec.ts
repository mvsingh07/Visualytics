import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Layout3aComponent } from './layout3a.component';

describe('Layout3aComponent', () => {
  let component: Layout3aComponent;
  let fixture: ComponentFixture<Layout3aComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [Layout3aComponent]
    });
    fixture = TestBed.createComponent(Layout3aComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
