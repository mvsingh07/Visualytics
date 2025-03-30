import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YaraComponent } from './yara.component';

describe('YaraComponent', () => {
  let component: YaraComponent;
  let fixture: ComponentFixture<YaraComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [YaraComponent]
    });
    fixture = TestBed.createComponent(YaraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
