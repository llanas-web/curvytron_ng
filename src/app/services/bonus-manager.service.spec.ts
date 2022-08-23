import { TestBed } from '@angular/core/testing';

import { BonusManagerService } from './bonus-manager.service';

describe('BonusManagerService', () => {
  let service: BonusManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BonusManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
