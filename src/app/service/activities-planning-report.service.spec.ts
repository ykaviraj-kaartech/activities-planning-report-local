import { TestBed } from '@angular/core/testing';

import { ActivitiesPlanningReportService } from './activities-planning-report.service';

describe('ActivitiesPlanningReportService', () => {
  let service: ActivitiesPlanningReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ActivitiesPlanningReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
