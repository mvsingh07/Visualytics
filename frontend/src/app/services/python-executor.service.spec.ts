import { TestBed } from '@angular/core/testing';

import { PythonExecutorService } from './python-executor.service';

describe('PythonExecutorService', () => {
  let service: PythonExecutorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PythonExecutorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
