import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Component, ElementRef, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { CdkPortal } from '@angular/cdk/portal';
import { ActivitiesPlanningReportService } from '../../service/activities-planning-report.service';
import { TabbedComponentComponent } from '../../components/tabbed-component/tabbed-component.component';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';


@Component({
  selector: 'app-planning-landing-page',
  templateUrl: './planning-landing-page.component.html',
  styleUrl: './planning-landing-page.component.scss',
})
export class PlanningLandingPageComponent {
   

}
