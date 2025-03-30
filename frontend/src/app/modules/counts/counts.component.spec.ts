import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CountsComponent } from './counts.component';

describe('CountsComponent', () => {
  let component: CountsComponent;
  let fixture: ComponentFixture<CountsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CountsComponent]
    });
    fixture = TestBed.createComponent(CountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
