import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionadminComponent } from './extensionadmin.component';

describe('ExtensionadminComponent', () => {
  let component: ExtensionadminComponent;
  let fixture: ComponentFixture<ExtensionadminComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ExtensionadminComponent]
    });
    fixture = TestBed.createComponent(ExtensionadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
