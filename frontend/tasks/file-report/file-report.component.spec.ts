import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileReportComponent } from './file-report.component';

describe('FileReportComponent', () => {
  let component: FileReportComponent;
  let fixture: ComponentFixture<FileReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FileReportComponent]
    });
    fixture = TestBed.createComponent(FileReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
