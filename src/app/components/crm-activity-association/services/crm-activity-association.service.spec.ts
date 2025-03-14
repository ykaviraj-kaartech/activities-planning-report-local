import { TestBed } from '@angular/core/testing';

import { CrmActivityAssociationService } from './crm-activity-association.service';

describe('CrmActivityAssociationService', () => {
  let service: CrmActivityAssociationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrmActivityAssociationService);
  }); 

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
