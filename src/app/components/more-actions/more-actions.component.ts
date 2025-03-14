import { Component, Input, ViewChild, HostListener, ElementRef, TemplateRef, ViewContainerRef } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivitiesPlanningReportService } from '../../service/activities-planning-report.service';
import { TabbedComponentComponent } from '../tabbed-component/tabbed-component.component';

@Component({
  selector: 'app-more-actions',
  templateUrl: './more-actions.component.html',
  styleUrls: ['./more-actions.component.scss']
})
export class MoreActionsComponent {
  @ViewChild('menuTemplate', { static: false }) menuTemplate!: TemplateRef<any>;
  @ViewChild(MatMenuTrigger) menuTrigger!: MatMenuTrigger;
  @Input() column: any | undefined;
  private overlayRef: OverlayRef | undefined;

  constructor(
    private overlay: Overlay,
    private viewContainerRef: ViewContainerRef,
    private elementRef: ElementRef,
    private activitiesPlanningReportService: ActivitiesPlanningReportService,
    public dialog: MatDialog,
  ) {}

  openMenuDropdown(event: MouseEvent) {
    event.preventDefault(); // Prevent any default behavior
    event.stopPropagation(); // Prevent immediate closing

    // Close existing menu if open
    this.closeMenu();

    // Define position strategy for overlay
    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo({ x: event.clientX, y: event.clientY })
      .withPositions([
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'top' },
      ])
      .withViewportMargin(10);

    // Create overlay reference
    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    // Close menu when clicking outside
    this.overlayRef.backdropClick().subscribe(() => this.closeMenu());

    // Attach menu template to overlay
    const portal = new TemplatePortal(this.menuTemplate, this.viewContainerRef);
    this.overlayRef.attach(portal);
  }

  closeMenu() {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef = undefined;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.menuTrigger.closeMenu();
    }
  }

  onAction() {
    console.log('Button Clicked!');
    this.menuTrigger.closeMenu();
  }

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: Event) {
  //   if (!this.elementRef.nativeElement.contains(event.target)) {
  //     this.closeMenu();
  //   }
  // }

  onEdit() {
    console.log('Edit clicked:', this.column);
    if (this.column.sales_activity_id == 4) {
        this.activitiesPlanningReportService.taskFormDetails(this.column.id).then((res: any) => {
          const dialogRef = this.dialog.open(TabbedComponentComponent, {
            height: '60%',
            width: '50%',
            data: {
              tabbed_content_type: 4,
              customer_id: this.column.application_reference_id,
              mode: "Edit",
              application_reference_id: this.column.application_reference_id,
              application_id: 36,
              formData: res[0]
            }
          });
          dialogRef.afterClosed().subscribe(async result => {
            if (result == "update required") {
                
            }
          })
        });
    }
  }

  onDelete() {
    console.log('Delete clicked');
    // this.closeMenu();
  }
  onCreate(){

  }
}
