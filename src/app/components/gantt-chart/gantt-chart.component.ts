import { Component, ViewChild, AfterViewInit, ViewContainerRef, ElementRef, ChangeDetectorRef, ApplicationRef, Injector, EnvironmentInjector, ComponentFactoryResolver, TemplateRef, Renderer2 } from '@angular/core';
// import ganttProps from '.gantt.config';
import { BryntumGanttComponent } from '@bryntum/gantt-angular';
import { CalendarModel, CellMenu, Gantt, ProjectModel, ScheduleMenu, ScrollButtons, StringHelper, TaskEdit, TaskModel, TaskTooltip, TimeAxisHeaderMenu } from '@bryntum/gantt';
import { ActivitiesPlanningReportService } from '../../service/activities-planning-report.service';
import { UserProfileComponent } from '../user-profile/user-profile.component'
import { MoreActionsComponent } from '../more-actions/more-actions.component'
import { withDebugTracing } from '@angular/router';
import { DateHelper, Toast } from '@bryntum/gantt';
import { TabbedComponentComponent } from '../tabbed-component/tabbed-component.component';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import moment from 'moment';
import { CdkPortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { PresetManager } from '@bryntum/gantt';
import { EventListenerFocusTrapInertStrategy } from '@angular/cdk/a11y';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HtmlEditorFormat } from 'devextreme/ui/html_editor';
import _, { filter, initial } from 'underscore';
import { MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';


export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD-MM-YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};


@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrl: './gantt-chart.component.scss',
   providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ]
})
export class GanttChartComponent {

  oidForTesting = "1813919e-ce3e-4f6f-820c-627aac1da0bb";
  @ViewChild('gantt', { static: false }) ganttCmp!: BryntumGanttComponent;
  
  @ViewChild('startInput') startInput!: ElementRef<HTMLInputElement>;
  @ViewChild('startPicker') startPicker!: MatDatepicker<Date>;
  @ViewChild('endInput') endInput!: ElementRef<HTMLInputElement>;
  @ViewChild('endPicker') endPicker!: MatDatepicker<Date>;

  ganttProps: any;
  tab: any = "Opportunities"; // Opportunities, People
  showTaskNonWorkingtime: any = true;

  isGanttRefreshRequired: boolean = false;
  isRefreshNeeded: boolean = false;
  overlayRef: OverlayRef | null = null;
  currentYear = new Date().getFullYear();
  selectedMonthIndex: number = new Date().getMonth();
  selectedYear = this.currentYear;
  isLoading: boolean = false;
  // startDateForData: any = moment({ year: 2024, month: 0, day: 1 }).format('YYYY-MM-DD');
  // endDateForData: any = moment({ year: 2024, month: 0 }).endOf('month').format('YYYY-MM-DD');
  startDateForData: any = moment({ year: new Date().getFullYear(), month: new Date().getMonth(), day: 1 }).format('YYYY-MM-DD');
  // endDateForData: any = moment({ year: new Date().getFullYear(), month: new Date().getMonth() }).endOf('month').format('YYYY-MM-DD');
  endDateForData: any = moment({ year: new Date().getFullYear(), month: new Date().getMonth() }).endOf('month').format('YYYY-MM-DD HH:mm:ss');
  scrollStartDate: any = moment(this.startDateForData).add(2, 'months').format('YYYY-MM-DD');
  subscriptionCreate: any;
  subscription: any;

  startDate: Date | null = null;
  endDate: Date | null = null;

  statusColorArray = [
    { id: 1, statusColorId: "#E9F8FA", statusTextColorId: "#1890FF", statusText: "Open" },
    { id: 2, statusColorId: "#FFF9ED", statusTextColorId: "#FC9E00", statusText: "In Progress" },
    { id: 3, statusColorId: "#E9FAF2", statusTextColorId: "#009132", statusText: "Completed" },
    { id: 5, statusColorId: "#FFEFEF", statusTextColorId: "#FF0000", statusText: "Rejected" },
    { id: 7, statusColorId: "#FDE4E2", statusTextColorId: "#C26256", statusText: "On Hold" }
  ]

  masterOpportunitiesList: any;

  popoverStyles = {
    'position': 'relative',
    'padding': '12px',
    'width': '16rem',
    'background': 'white',
    'border-radius': '8px',
    'box-shadow': '0px 0px 10px rgba(0, 0, 0, 0.2)',
    'text-align': 'center',
    'font-family': 'DM Sans',
    'top': '22px'
  };

  yearChangeArrow = {
    'border': 'none',
    'background': 'none'
  }
  
  
    yearNavigation = {
      'display': 'flex',
      'justify-content': 'space-between',
      'align-items': 'center',
      'padding': '0px 0px 0px 0px'
    }
    yearLabel = {
      'font-size': '16px',
      'font-weight': '500',
      'color': '#45546E'
    }
    monthGrid = {
      'display': 'grid',
      'grid-template-columns': 'repeat(4, 1fr)',
      'row-gap': '6%',
      'padding': '10px 0 10px 0px'
    }
    monthGridButton = {
      'border': 'none',
      'font-weight': '500',
      'letter-spacing': '0.5px',
      'font-size': '13px',
      'border-radius': '12px',
      'text-align': 'center',
      'cursor': 'pointer',
      'width': '35px',
      'height': '24px',
      'transition': '0.3s ease'
    }
  
  
  
  
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  @ViewChild('popoverTemplate') popoverTemplate!: TemplateRef<any>;

  isSlicerLoading: boolean = true;
  isResetButtonPresent: boolean = false;
  isSlicerOn: boolean = false;

  sbuArray: any[] = [];
  buArray: any[] = [];
  soArray: any[] = [];
  ownerArray: any[] = [];
  sbuMain: any[] = [];
  buMain: any[] = [];
  soMain: any[] = [];
  ownerMain: any[] = [];

  filterModel: any = {};
  
  slicerName!: string;
  selectedItem!: { [key: string]: any };

  sbuFilter: boolean = false;
  buFilter: boolean = false;
  ownerFilter: boolean = false;
  salesOrgFilter: boolean = false;
  filterConfig: any = {};
  slicerData: any = {};

  constructor(
    private activitiesPlanningReportService: ActivitiesPlanningReportService,
    private viewContainerRef: ViewContainerRef,
    private injector: Injector,
    private appRef: ApplicationRef,
    public dialog: MatDialog,
    private overlay: Overlay, 
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private snackBar : MatSnackBar,
  ) {}

  ngOnInit() {
    this.isSlicerLoading = true;
    this.loadHeaderTasks();
    this.activitiesPlanningReportService.getMasterOpportunitiesList().subscribe({
      next: (response) => {
        this.masterOpportunitiesList = response
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  // modifyTasksData(tasks: any[]) {
  //   return tasks.map(task => ({
  //       ...task,
  //       manuallyScheduled: true,
  //       // constraintDate: null,
  //       // startDate: task.startDate,
  //       // endDate: task.endDate,
  //       // dependencies: [],
  //       // projectConstraintResolution: 'ignore'
  //   }));
  // }

  modifyTasksData(tasks: any){
    return tasks.map((task: any) => {
      const updatedTask = {
          ...task,
          manuallyScheduled: true,
      };
      if (task?.is_activity != 1 && task?.is_activity != true){
        updatedTask.style = 'background-color: #F2E1F8; border-radius: 8px'
      }
      else{
        if(task?.activity_status_id == 1){
          updatedTask.style = 'background-color: #CBEDFF; border-radius: 8px'
        }
        else if(task?.activity_status_id == 2){
          updatedTask.style = 'background-color: #FFE2C3; border-radius: 8px'
        }
        else if(task?.activity_status_id == 3){
          updatedTask.style = 'background-color: #E0F7D3; border-radius: 8px'
        }
        else if(task?.activity_status_id == 5){
          updatedTask.style = 'background-color: #FFC5C5; border-radius: 8px'
        }
        else if(task?.activity_status_id == 7){
          updatedTask.style = 'background-color: #E6BAB5; border-radius: 8px'
        }
        else{
          updatedTask.style = 'background-color: #FFDFC1; border-radius: 8px'
        }
      }

      if (updatedTask.children && Array.isArray(updatedTask.children)) {
          updatedTask.children = this.modifyTasksData(updatedTask.children);
      }

      return updatedTask;
    });
  }

  loadHeaderTasks() {
    this.ganttProps = undefined;
      if (this.tab === "Opportunities"){
        this.isLoading = true;
        this.activitiesPlanningReportService.getActivitiesDataForGanttForId(this.tab, 36, this.startDateForData, this.endDateForData).subscribe((tasks: any) => {
          this.isLoading = false;
          let data = tasks?.messType == 'S' ? tasks?.messData[0] : []
          this.ganttProps = {
            project: {
              autoLoad: true,
              tasksData: this.modifyTasksData(data)
            },
            startDate : '2009-01-12',
            endDate : '2029-03-24',
            taskRenderer: ({ taskRecord, taskElement }: { taskRecord: any, taskElement: any }) => {
              const taskName = taskRecord.name || 'No Name';
              
              const taskBarContent = document.createElement('div');
              taskBarContent.innerHTML = `
                <span class="task-name">${taskName}</span>
              `;
        
              taskBarContent.style.position = 'absolute';
              taskBarContent.style.top = '50%';
              taskBarContent.style.left = '50%';
              taskBarContent.style.transform = 'translate(-50%, -50%)';
              taskBarContent.style.color = 'white';
              taskBarContent.style.fontWeight = 'bold';
              taskBarContent.style.fontSize = '12px';
        
              taskElement.appendChild(taskBarContent);
            },
            features: {
              labels: {
                right: {
                   renderer : ({ taskRecord }: { taskRecord: any }) => {
                    if(taskRecord?.data?.is_activity === 1 || taskRecord?.data?.is_activity === true){
                      let currentDate = moment();
                      let statusToCheck = [1,2,7];
                      if((moment(taskRecord?.data?.endDate) > currentDate) && statusToCheck.includes(taskRecord?.data?.activity_status_id)){
                        return '!'
                      }
                      else{
                        return;
                      }
                    }
                    else{
                      return;
                    }
                  }
                }
              },
              taskTooltip : {
                template : ({ taskRecord }: { taskRecord: any }) => {
                  if(taskRecord?.data?.is_activity == 1 || taskRecord?.data?.is_activity == true){
                    return `
                      <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; justify-content: between; gap: 14px;">
                          <div>Name</div>
                          <div>:</div>
                          <span>${taskRecord.name}</span>
                        </div>
                        <div style="display: flex; justify-content: between; gap: 14px;">
                          <div>Start Date</div>
                          <div>:</div>
                          <span>${moment(taskRecord.startDate).format('DD-MM-YYYY')}</span>
                        </div>
                        <div style="display: flex; justify-content: between; gap: 14px;">
                          <div>Due Date</div>
                          <div>:</div>
                          <span>${moment(taskRecord.endDate).format('DD-MM-YYYY')}</span>
                        </div>
                        <div style="display: flex; justify-content: between; gap: 14px;">
                          <div>Activity Status</div>
                          <div>:</div>
                          <span>${this.getActivityStatusColor(taskRecord?.data?.activity_status_id, this.statusColorArray).statusText}</span>
                        </div>
                      </div>
                    `;
                  }
                  else{
                    return `
                      <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; justify-content: between; gap: 14px;">
                          <div>Opportunity Name</div>
                          <div>:</div>
                          <span>${taskRecord.name}</span>
                        </div>
                        <div style="display: flex; justify-content: between; gap: 14px;">
                          <div>Start Date</div>
                          <div>:</div>
                          <span>${moment(taskRecord.startDate).format('DD-MM-YYYY')}</span>
                        </div>
                        <div style="display: flex; justify-content: between; gap: 14px;">
                          <div>Due Date</div>
                          <div>:</div>
                          <span>${moment(taskRecord.endDate).format('DD-MM-YYYY')}</span>
                        </div>
                      </div>
                    `;
                  }
                }
              },              
              scrollButtons: true,
              projectLines: false,
              taskEdit: false,
              dependencies: false,
              pan : true,
              eventDragCreate : false,
              taskSelection: {
                enabled: false,
              },
              // taskTooltip: {
              //   enabled: true,
              //   template: null,
              //   tooltipTemplate({ taskRecord }: { taskRecord: any }) {
              //     console.log('Tooltip triggered for:', taskRecord.name);
              //     return `
              //       <div class="custom-tooltip">
              //         <p><strong>${taskRecord.name || 'Leave'}</strong></p>
              //         <p>Start: ${DateHelper.format(taskRecord.startDate, 'L')}</p>
              //         <p>End: ${DateHelper.format(taskRecord.endDate, 'L')}</p>
              //       </div>
              //     `;
              //   }
              // }
            },
            columns: [
              { type: 'name', text: 'Opportunity / Task', field: 'name', width: 250, editor: false,
                renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                  cellElement.style.borderRight = 'none';
                  return record.name;
                },
                afterRenderCell : ({ record, row, cellElement }: { record: any, row: any, cellElement: any }) => {
                  // cellElement.classList.toggle('myClass', true);
                  cellElement.style.borderRight = 'none';
                  // row.cls.newRow = record.isPhantom;
                }
              },
              { text: 'Assigned To', field: 'assigned_to', htmlEncode: false, width: 200, editor: false,
                renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                  cellElement.style.borderRight = 'none';
                  return `<div class="user-profile-placeholder" data-assigned-to="${record.assigned_to}"></div>`;
                },
                afterRenderCell : ({ record, row, cellElement }: { record: any, row: any, cellElement: any }) => {
                  // cellElement.classList.toggle('myClass', true);
                  cellElement.style.borderRight = 'none';
                  // row.cls.newRow = record.isPhantom;
                }
              },
              { text: 'Start Date', field: 'start_date', htmlEncode: false, width: 200, editor: false,
                renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                  cellElement.style.borderRight = 'none';
                  if(record?.data?.is_activity === 1 || record?.data?.is_activity === true){
                    return moment(record?.data?.startDate).format("DD MMM YYYY");
                  }
                  else{
                    return;
                  }
                },
                afterRenderCell : ({ record, row, cellElement }: { record: any, row: any, cellElement: any }) => {
                  // cellElement.classList.toggle('myClass', true);
                  cellElement.style.borderRight = 'none';
                  // row.cls.newRow = record.isPhantom;
                }
              },
              { text: 'End Date', field: 'end_date', htmlEncode: false, width: 200, editor: false,
                renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                  cellElement.style.borderRight = 'none';
                  if(record?.data?.is_activity === 1 || record?.data?.is_activity === true){
                    return moment(record?.data?.endDate).format("DD MMM YYYY");
                  }
                  else{
                    return;
                  }
                },
                afterRenderCell : ({ record, row, cellElement }: { record: any, row: any, cellElement: any }) => {
                  // cellElement.classList.toggle('myClass', true);
                  cellElement.style.borderRight = 'none';
                  // row.cls.newRow = record.isPhantom;
                }
              },
              { text: 'Status', field: 'activity_status_id', htmlEncode: false, width: 200, editor: false,
                renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                  // cellElement.style.borderRight = 'none';
                  if(record?.data?.is_activity === 1 || record?.data?.is_activity === true){
                    let cellParams = this.getActivityStatusColor(record?.data?.activity_status_id, this.statusColorArray)
                    console.log('cellParams', cellParams);
                    const chipHtml = `
                      <span class="activity-chip"
                            style="
                              background-color: ${cellParams.statusColor};
                              color: ${cellParams.statusTextColor};
                              padding: 4px 10px;
                              width: 86px;
                              text-align: center;
                              font-size: 12px;
                              display: inline-block;
                              font-weight: 500;
                            ">
                        ${cellParams.statusText}
                      </span>
                    `;

                    return chipHtml;
                  }
                  else{
                    return;
                  }
                },
              },
              { text: 'Actions', width: 50, editor: false,
                
              }
            ],
            listeners: {
              beforeExpand: ({ record }: { record: any }) => {
                if (!record.children.length) {
                  // this.loadChildTasks(record);
                }
              },
              taskdblclick: (event: any) => {
                event.preventDefault();
              }
            }
          };
          this.initializeSlicerData(data);
          // this.updateColumns();
  
        });
      }
      else if (this.tab === "People"){
        this.isLoading = true;
        this.activitiesPlanningReportService.getActivitiesDataForGanttForId(this.tab, 36, this.startDateForData, this.endDateForData).subscribe((tasks: any) => {
          this.isLoading = false;
          let taskData = tasks?.messType == 'S' ? tasks?.messData[0] : []
          let leaveData = tasks?.messType == 'S' ? tasks?.messData[1] : []
          this.ganttProps = {
            tooltipCls: 'custom-tooltip',
            project: {
              autoLoad: true,
              tasksData: this.modifyTasksData(taskData),
              calendarsData: leaveData,
            },
            taskRenderer: ({ taskRecord, tplData }: { taskRecord: any, tplData: any }) => {
              if (taskRecord.startDate) {
                  tplData.style = `background-color: ${taskRecord.color || 'gray'}; border-color: ${taskRecord.borderColor || 'black'};`;
              }
            },
            startDate : '2021-01-12',
            endDate : '2026-03-24',
            features: {
              labels: {
                right: {
                   renderer : ({ taskRecord }: { taskRecord: any }) => {
                    if(taskRecord?.data?.is_activity === 1 || taskRecord?.data?.is_activity === true){
                      let currentDate = moment();
                      let statusToCheck = [1,2,7];
                      if((moment(taskRecord?.data?.endDate) > currentDate) && statusToCheck.includes(taskRecord?.data?.activity_status_id)){
                        return '!'
                      }
                      else{
                        return;
                      }
                    }
                    else{
                      return;
                    }
                  }
                }
              },
              taskTooltip : {
                template : ({ taskRecord }: { taskRecord: any }) => {
                  if(taskRecord?.data?.is_activity == 1 || taskRecord?.data?.is_activity == true){
                    return `
                      <div style="display: flex; flex-direction: column; gap: 4px;">
                        <div style="display: flex; justify-content: between; gap: 14px;">
                          <div>Name</div>
                          <div>:</div>
                          <span>${taskRecord.name}</span>
                        </div>
                        <div style="display: flex; justify-content: between; gap: 14px;">
                          <div>Start Date</div>
                          <div>:</div>
                          <span>${moment(taskRecord.startDate).format('DD-MM-YYYY')}</span>
                        </div>
                        <div style="display: flex; justify-content: between; gap: 14px;">
                          <div>Due Date</div>
                          <div>:</div>
                          <span>${moment(taskRecord.endDate).format('DD-MM-YYYY')}</span>
                        </div>
                        <div style="display: flex; justify-content: between; gap: 14px;">
                          <div>Activity Status</div>
                          <div>:</div>
                          <span>${this.getActivityStatusColor(taskRecord?.data?.activity_status_id, this.statusColorArray).statusText}</span>
                        </div>
                      </div>
                    `;
                  }
                  else{
                    return ``;
                  }
                }
              }, 
              scrollButtons: true,
              columnPicker : true,
              sort  : false,
              group : false,
              projectLines: false,
              eventMenu: false,
              scheduleMenu: false,
              timeAxisHeaderMenu: false,
              cellMenu: false,
              taskContextMenu: false,
              ContextMenuBase: false,
              taskNonWorkingTime: {
                // tooltip: {
                //   listeners: {
                //       beforeShow({ source }: any) {
                //           source.element.style.backgroundColor = "#F7F9FB";
                //           source.element.style.color = "black";
                //           source.element.style.borderRadius = "8px";
                //           source.element.style.padding = "10px";
                //       }
                //   }
                // },
                tooltipTemplate({ name, startDate, endDate }: {name: any, startDate: any, endDate: any}) {
                    return `
                        <p class="custom-tooltip">${name || 'Leave'}</p>
                        ${moment(startDate).format('DD-MM-YYYY')} to ${moment(endDate).format('DD-MM-YYYY')}
                    `;
                }
              },
              nonWorkingTime: {
                  disabled: true
              },
              taskEdit: false,
              dependencies: false
            },
            columns: [
              {
                type: 'tree', text: '', width: 50, flex: 0, minWidth: 50, editor: false,
                renderer: ({ cellElement }: { cellElement: HTMLElement }) => {
                  cellElement.style.borderRight = 'none';
                },
                afterRenderCell : ({ record, row, cellElement }: { record: any, row: any, cellElement: any }) => {
                  // cellElement.classList.toggle('myClass', true);
                  cellElement.style.borderRight = 'none';
                  // row.cls.newRow = record.isPhantom;
                }
              },
              { type: 'name', text: 'People / Task', field: 'name', width: 250, editor: false,
                renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                  cellElement.style.borderRight = 'none';
                  cellElement.style.paddingTop = '12px';
                  cellElement.style.paddingBottom = '8px';
                  cellElement.style.overflow = 'hidden';
                  cellElement.style.textOverflow = 'ellipsis';
                  cellElement.style.whiteSpace = 'nowrap';
                
                  return `
                    <div 
                      class="user-profile-placeholder" 
                      data-assigned-to="${record.name}" 
                      style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block;"
                      title="${record.name}"  <!-- Tooltip fallback -->
                    >
                      ${record.name}
                    </div>`;
                },
                afterRenderCell : ({ record, row, cellElement }: { record: any, row: any, cellElement: any }) => {
                  // cellElement.classList.toggle('myClass', true);
                  cellElement.style.borderRight = 'none';
                  cellElement.style.paddingTop = '12px';
                  cellElement.style.paddingBottom = '8px';
                  // row.cls.newRow = record.isPhantom;
                }
              },
              { text: 'Opportunity Name', field: 'opportunity_name', htmlEncode: false, width: 200, editor: false,
                renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                  cellElement.style.borderRight = 'none';
                  if(record?.data?.opportunity_name){
                    cellElement.style.cursor = 'pointer';
                    cellElement.addEventListener('click', (event) => {
                      this.routeToOpportunity(record);
                    });
                  }
                  return record?.data?.opportunity_name;
                },
                afterRenderCell : ({ record, row, cellElement }: { record: any, row: any, cellElement: any }) => {
                  // cellElement.classList.toggle('myClass', true);
                  cellElement.style.borderRight = 'none';
                  if(record?.data?.opportunity_name){
                    cellElement.style.cursor = 'pointer';
                  }
                }
              },
              { text: 'Start Date', field: 'start_date', htmlEncode: false, width: 200, editor: false,
                renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                  cellElement.style.borderRight = 'none';
                  if(record?.data?.is_activity === 1 || record?.data?.is_activity === true){
                    return moment(record?.data?.startDate).format("DD MMM YYYY");
                  }
                  else{
                    return;
                  }
                },
                afterRenderCell : ({ record, row, cellElement }: { record: any, row: any, cellElement: any }) => {
                  // cellElement.classList.toggle('myClass', true);
                  cellElement.style.borderRight = 'none';
                  // row.cls.newRow = record.isPhantom;
                }
              },
              { text: 'End Date', field: 'end_date', htmlEncode: false, width: 150, editor: false,
                renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                  cellElement.style.borderRight = 'none';
                  if(record?.data?.is_activity === 1 || record?.data?.is_activity === true){
                    return moment(record?.data?.endDate).format("DD MMM YYYY");
                  }
                  else{
                    return;
                  }
                },
                afterRenderCell : ({ record, row, cellElement }: { record: any, row: any, cellElement: any }) => {
                  // cellElement.classList.toggle('myClass', true);
                  cellElement.style.borderRight = 'none';
                  // row.cls.newRow = record.isPhantom;
                }
              },
              { text: 'Status', field: 'activity_status_id', htmlEncode: false, width: 200, editor: false,
                renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                  // cellElement.style.borderRight = 'none';
                  if(record?.data?.is_activity === 1 || record?.data?.is_activity === true){
                    let cellParams = this.getActivityStatusColor(record?.data?.activity_status_id, this.statusColorArray)
                    console.log('cellParams', cellParams);
                    const chipHtml = `
                      <span class="activity-chip"
                            style="
                              background-color: ${cellParams.statusColor};
                              color: ${cellParams.statusTextColor};
                              padding: 4px 10px;
                              width: 86px;
                              text-align: center;
                              font-size: 12px;
                              display: inline-block;
                              font-weight: 500;
                            ">
                        ${cellParams.statusText}
                      </span>
                    `;

                    return chipHtml;
                  }
                  else{
                    return;
                  }
                },
              },
              { text: 'Actions', width: 50, editor: false,
                
              }
            ],
            listeners: {
              taskClick: ({ taskRecord, event }: { taskRecord: any, event: any }) => {
                // this.openCustomDialog(taskRecord, event)
              },
              beforeExpand: ({ record }: { record: any }) => {
                if (!record.children.length) {
                  // this.loadChildTasks(record);
                }
              },
              taskresize: ({ taskRecord }: any) => {
              },
              taskdrag: ({ taskRecord }: any) => {
              }
            }
          };
          this.initializeSlicerData(taskData);
          this.updateColumns();
        });
      }
  }

  // onTaskExpand({ record }: { record: any }) {
  //   console.log('Task expanded:', record);
  //   if (!record.children || record.children.length === 0) {
  //     this.loadChildTasks(record);
  //   }
  // }
  onTaskExpand(event: any){
    console.log('event', event);
  }

  ngAfterViewInit(){
    const ganttInstance = this.ganttCmp.instance;
    let columns: any[] = Array.isArray(ganttInstance.columns)
      ? ganttInstance.columns
      : (ganttInstance.columns as any).allRecords || [];
    ganttInstance.taskStore.on('taskResizeEnd', ({ changed, taskRecord, resizeData }: {changed: any, taskRecord: any, resizeData: any}) => { 
    });
    ganttInstance.taskStore.on('add', (event: any) => {
      const record = event.source;
  
      if (!record.children || record.children.length === 0) {
        // this.loadChildTasks(event.parent);
      }
    });
    ganttInstance.on('taskContextMenu', ({ source, taskRecord, event }: { source: any, taskRecord: any, event: any }) => { 
      event.preventDefault();
    });
    ganttInstance.on('cellContextMenu', ({ grid, record, column, cellElement, target, event }: { grid: any, record: any, column: any, cellElement: any, target: any, event: any }) => { 
      event.preventDefault();
    });
    // ganttInstance.on('headerContextMenu', ({ event }: { event: any }) => { 
    //   event.preventDefault();
    // });
    ganttInstance.on('cellDblClick', (event: any) => {
      event.stopPropagation();
    });
    ganttInstance.on('afterRenderCell', ({ record, row, cellElement }: any) => {
      if (record.isParent && !record.hasChildren) {
        cellElement.classList.add('b-tree-expander b-icon b-icon-tree-expand');
      }
    });
    // ganttInstance.scrollToDate(new Date('2024-02-01'));
    ganttInstance.scrollToDate(new Date(this.scrollStartDate));
    ganttInstance.on('event', ({ event, params }: {event: any, params: any}) => {
    });

  ganttInstance.on('taskClick', (taskEvent: any) => {
    const task = taskEvent.task;
    if (taskEvent.taskRecord.data?.is_activity === 1 || taskEvent.taskRecord.data?.is_activity === true){
      this.activitiesPlanningReportService.taskFormDetails(taskEvent.taskRecord.data?.id).then((res: any) => {
        const dialogRef = this.dialog.open(TabbedComponentComponent, {
          height: '87%',
          width: '45rem',
          maxHeight: 'fit-content',
          data: {
            tabbed_content_type: 4,
            customer_id: taskEvent.taskRecord.data?.application_reference_id,
            mode: "Edit",
            application_reference_id: taskEvent.taskRecord.data?.application_reference_id,
            application_id: 36,
            formData: res[0],
            masterData: this.masterOpportunitiesList
          }
        });
        dialogRef.afterClosed().subscribe(async result => {
          if (result?.text == "update required") {
            this.loadChildTasks(taskEvent?.taskRecord?.parent);
          }
        })
      });
    }
    
    // this.openCustomTaskForm(task);
  });

//   ganttInstance.project.taskStore.on({
//     beforeAdd: ({ record }: {record: any}) => {
//         record.manuallyScheduled = true;
//         record.constraintType = 'startnoearlierthan';
//         record.constraintDate = record.startDate;
//     }
// });

    ganttInstance.project.on('beforeValidate', ({ action, record, isValid }: { action: any, record: any, isValid: any }) => {
      if (action === 'update' && (record.startDate > record.endDate)) {
          isValid = true;
      }
      return isValid;
    });

    ganttInstance.project.on('beforeTaskValidate', ({ taskRecord, changes, isValid }: { taskRecord: any, changes: any, isValid: any }) => {
      if (taskRecord.startDate > taskRecord.endDate) {
          isValid = true;
      }
      return isValid;
  });

  ganttInstance.project.taskStore.on('update', ({ record, changes }: { record: TaskModel, changes: any }) => {
    if ((record as any).data.is_activity == 1 || (record as any).data.is_activity == true){
  
      if (changes.startDate || changes.endDate) {
        this.activitiesPlanningReportService.updateActivityDates((record as any).data.id, record.startDate, record.endDate).subscribe((task: any) => {
          if(this.tab == 'Opportunities'){
            this.loadChildTasks(ganttInstance.taskStore.getById((record as any).data?.application_reference_id));
            this.cdr.detectChanges();
          }
          else if(this.tab == 'People'){
            this.loadChildTasks(ganttInstance.taskStore.getById((record as any).data?.assigned_to));
            this.cdr.detectChanges();
          }
          this.showSnackBar("Date has been updated", 2000);
          this.isGanttRefreshRequired = true;
        });
      }
    }
  });

  ganttInstance.on({
    "*": (eventName: string, params: any) => {
    }
  });

  ganttInstance.project.taskStore.on({
    "*": (eventName: string, params: any) => {
    }
  });
  ganttInstance.project.taskStore.addListener({
    expand: ({ record }: { record: TaskModel }) => {
    }
  });

    ganttInstance.on('ready', () => {
      // this.loadUserProfileComponents();
    });

    columns.forEach((col: any) => {
      if (this.tab === "Opportunities" && col.data.field === 'assigned_to') {
        col.renderer = (value: any, task: any, column: any) => {
          if (value?.record?.data?.sales_activity_id !== undefined || value?.record?.data?.sales_activity_id != null){
            
            const container = document.createElement('div');
      
            const componentRef = this.viewContainerRef.createComponent(UserProfileComponent, {
              injector: this.injector
            });
       
      
            componentRef.instance.oid = value?.record?.data?.assigned_to;
            componentRef.instance.type = 'small';
      
            container.appendChild(componentRef.location.nativeElement);
      
            componentRef.changeDetectorRef.detectChanges();
      
            return container;
          }
          return;
        };
      }
      else if (this.tab === "People" && col.data.field === 'name') {
        col.renderer = (value: any, task: any, column: any) => {
          if (value?.record?.data?.is_activity === 1 || value?.record?.data?.is_activity === true){
            return value?.record?.data?.name;
          }
            
            const container = document.createElement('div');
      
            const componentRef = this.viewContainerRef.createComponent(UserProfileComponent, {
              injector: this.injector
            });

            componentRef.instance.oid = value?.value;
            componentRef.instance.type = 'small';
      
            container.appendChild(componentRef.location.nativeElement);
      
            componentRef.changeDetectorRef.detectChanges();
      
            return container;
          
          return;
        };
      }
      else if (col.data.text === 'Actions') {
        col.renderer = (value: any, task: any, column: any) => {
            
            const container = document.createElement('div');
      
            const componentRef = this.viewContainerRef.createComponent(MoreActionsComponent, {
              injector: this.injector
            });
      
            componentRef.instance.column = value?.record?.data;
            componentRef.instance.masterData = this.masterOpportunitiesList;

            if (this.tab == "Opportunities"){
              this.subscription = componentRef.instance.actionClickedForCreate.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                this.loadChildTasks(ganttInstance.taskStore.getById(eventData?.activity?.id));
                this.cdr.detectChanges();
              });

              this.subscription = componentRef.instance.actionClickedForEdit.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                this.loadChildTasks(ganttInstance.taskStore.getById(eventData?.activity?.application_reference_id));
                this.cdr.detectChanges();
              });

              this.subscription = componentRef.instance.actionClickedForDelete.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                this.loadChildTasks(ganttInstance.taskStore.getById(eventData?.activity?.application_reference_id));
                this.cdr.detectChanges();
              });
            }
            else if (this.tab == "People"){
              this.subscription = componentRef.instance.actionClickedForCreate.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                let parentItem = ganttInstance.taskStore?.find((item: any) => item?.name == eventData?.newData?.assignedTo);
                this.loadChildTasks(parentItem);
                this.cdr.detectChanges();
              })

              this.subscription = componentRef.instance.actionClickedForEdit.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                let parentItem = ganttInstance.taskStore?.find((item: any) => item?.name == eventData?.newData?.assignedTo);
                this.loadChildTasks(parentItem);
                // if (eventData?.activity?.assigned_to != eventData?.newData?.assignedTo){
                //   let parentItem = ganttInstance.taskStore?.find((item: any) => item?.name == eventData?.activity?.assigned_to);
                //   this.loadChildTasks(parentItem);
                // }
                this.cdr.detectChanges();
              })

              this.subscription = componentRef.instance.actionClickedForDelete.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                let parentItem = ganttInstance.taskStore?.find((item: any) => item?.name == eventData?.activity?.assigned_to);
                this.loadChildTasks(parentItem);
                this.cdr.detectChanges();
              })
            }
      
            container.appendChild(componentRef.location.nativeElement);
      
            componentRef.changeDetectorRef.detectChanges();
      
            return container;
        };
      }
    });

    const lockedSubgrids = document.querySelectorAll('[id^="b-gantt-"][id$="-lockedSubgrid"]');
    lockedSubgrids.forEach((el) => {
      this.renderer.setStyle(el, 'background-image', 'none');
    });

    setTimeout(() => {
      const ganttHeader = document.querySelector('.b-grid-header-container');
      if (ganttHeader) {
        ganttHeader.addEventListener('contextmenu', (event) => {
          event.preventDefault();
        });
      }
    }, 500);

    const lockedSubgrids2 = document.querySelectorAll('[id^="b-gantt-"][id$="-normalSubgrid"]');
    lockedSubgrids2.forEach((el) => {
      this.renderer.setStyle(el, 'background-image', 'none');
    });
    const lockedSubgrids3 = document.querySelectorAll('[id^="bryntum-gantt-"][id$="-normalSubgrid"]');
    lockedSubgrids3.forEach((el) => {
      this.renderer.setStyle(el, 'background-image', 'none');
    });
    const lockedSubgrids4 = document.querySelectorAll('[id^="bryntum-gantt-"][id$="-lockedSubgrid"]');
    lockedSubgrids4.forEach((el) => {
      this.renderer.setStyle(el, 'background-image', 'none');
    });
    let tooltipElement = document.querySelector('.b-tooltip') as HTMLElement;
    tooltipElement.style.display = 'none';
    
  }

  ngAfterViewChecked(){
    if(!this.isGanttRefreshRequired){
      return;
    }
    this.isGanttRefreshRequired = false;
    const ganttInstance = this.ganttCmp.instance;
    let columns: any[] = Array.isArray(ganttInstance.columns)
      ? ganttInstance.columns
      : (ganttInstance.columns as any).allRecords || [];
    ganttInstance.taskStore.on('taskResizeEnd', ({ changed, taskRecord, resizeData }: {changed: any, taskRecord: any, resizeData: any}) => { 
    });
    ganttInstance.taskStore.on('add', (event: any) => {
      const record = event.source;
  
      if (!record.children || record.children.length === 0) {
        // this.loadChildTasks(event.parent);
      }
    });
    ganttInstance.on('taskContextMenu', ({ source, taskRecord, event }: { source: any, taskRecord: any, event: any }) => { 
      event.preventDefault();
    });
    ganttInstance.on('cellContextMenu', ({ grid, record, column, cellElement, target, event }: { grid: any, record: any, column: any, cellElement: any, target: any, event: any }) => { 
      event.preventDefault();
    });
    // ganttInstance.scrollToDate(new Date('2024-02-01'));
    ganttInstance.scrollToDate(new Date(this.scrollStartDate));
    ganttInstance.on('event', ({ event, params }: {event: any, params: any}) => {
    });

  ganttInstance.on('taskClick', (taskEvent: any) => {
    const task = taskEvent.task;
    if (taskEvent.taskRecord.data?.is_activity === 1 || taskEvent.taskRecord.data?.is_activity === true){
      this.activitiesPlanningReportService.taskFormDetails(taskEvent.taskRecord.data?.id).then((res: any) => {
        const dialogRef = this.dialog.open(TabbedComponentComponent, {
          height: '87%',
          width: '45rem',
          maxHeight: 'fit-content',
          data: {
            tabbed_content_type: 4,
            customer_id: taskEvent.taskRecord.data?.application_reference_id,
            mode: "Edit",
            application_reference_id: taskEvent.taskRecord.data?.application_reference_id,
            application_id: 36,
            formData: res[0],
            masterData: this.masterOpportunitiesList
          }
        });
        dialogRef.afterClosed().subscribe(async result => {
          if (result?.text == "update required") {
            this.loadChildTasks(taskEvent?.taskRecord?.parent);
          }
        })
      });
    }

    // this.openCustomTaskForm(task);
  });

//   ganttInstance.project.taskStore.on({
//     beforeAdd: ({ record }: {record: any}) => {
//         record.manuallyScheduled = true;
//         record.constraintType = 'startnoearlierthan';
//         record.constraintDate = record.startDate;
//     }
// });

    ganttInstance.project.on('beforeValidate', ({ action, record, isValid }: { action: any, record: any, isValid: any }) => {
      if (action === 'update' && (record.startDate > record.endDate)) {
          isValid = true;
      }
      return isValid;
    });

    ganttInstance.project.on('beforeTaskValidate', ({ taskRecord, changes, isValid }: { taskRecord: any, changes: any, isValid: any }) => {
      if (taskRecord.startDate > taskRecord.endDate) {
          isValid = true;
      }
      return isValid;
  });

// ganttInstance.project.taskStore.on('beforeAdd', ({ source, records, parent }: { source: any, records: any, parent: any }) => {
//   records.manuallyScheduled = true;
//   records.constraintType = 'startnoearlierthan';
//   records.constraintDate = records.startDate;
// })

  ganttInstance.project.taskStore.on('update', ({ record, changes }: { record: TaskModel, changes: any }) => {
    if ((record as any).data.is_activity == 1 || (record as any).data.is_activity == true){
  
      if (changes.startDate || changes.endDate) {
        this.activitiesPlanningReportService.updateActivityDates((record as any).data.id, record.startDate, record.endDate).subscribe((task: any) => {
          if(this.tab == 'Opportunities'){
            this.loadChildTasks(ganttInstance.taskStore.getById((record as any).data?.application_reference_id));
            this.cdr.detectChanges();
          }
          else if(this.tab == 'People'){
            this.loadChildTasks(ganttInstance.taskStore.getById((record as any).data?.assigned_to));
            this.cdr.detectChanges();
          }
          this.showSnackBar("Date has been updated", 2000);
        });
      }
    }
  });

  ganttInstance.on({
    "*": (eventName: string, params: any) => {
        console.log(`test for Gantt Event: ${eventName}`, params);
    }
  });

  ganttInstance.project.taskStore.on({
    "*": (eventName: string, params: any) => {
        console.log(`TaskStore Event: ${eventName}`, params);
    }
  });
  ganttInstance.project.taskStore.addListener({
    expand: ({ record }: { record: TaskModel }) => {
    }
  });

    ganttInstance.on('ready', () => {
      // this.loadUserProfileComponents();
    });

    columns.forEach((col: any) => {
      if (this.tab === "Opportunities" && col.data.field === 'assigned_to') {
        col.renderer = (value: any, task: any, column: any) => {
          if (value?.record?.data?.sales_activity_id !== undefined || value?.record?.data?.sales_activity_id != null){
            
            const container = document.createElement('div');
      
            const componentRef = this.viewContainerRef.createComponent(UserProfileComponent, {
              injector: this.injector
            });
       
      
            componentRef.instance.oid = value?.record?.data?.assigned_to;
            componentRef.instance.type = 'small';
      
            container.appendChild(componentRef.location.nativeElement);
      
            componentRef.changeDetectorRef.detectChanges();
      
            return container;
          }
          return;
        };
      }
      else if (this.tab === "People" && col.data.field === 'name') {
        col.renderer = (value: any, task: any, column: any) => {
          if (value?.record?.data?.is_activity === 1 || value?.record?.data?.is_activity === true){
            return value?.record?.data?.name;
          }
            
            const container = document.createElement('div');
      
            const componentRef = this.viewContainerRef.createComponent(UserProfileComponent, {
              injector: this.injector
            });

            componentRef.instance.oid = value?.value;
            componentRef.instance.type = 'small';
      
            container.appendChild(componentRef.location.nativeElement);
      
            componentRef.changeDetectorRef.detectChanges();
      
            return container;
          
          return;
        };
      }
      else if (col.data.text === 'Actions') {
        col.renderer = (value: any, task: any, column: any) => {
            
            const container = document.createElement('div');
      
            const componentRef = this.viewContainerRef.createComponent(MoreActionsComponent, {
              injector: this.injector
            });
      
            componentRef.instance.column = value?.record?.data;
            componentRef.instance.masterData = this.masterOpportunitiesList;

            if (this.tab == "Opportunities"){
              this.subscription = componentRef.instance.actionClickedForCreate.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                this.loadChildTasks(ganttInstance.taskStore.getById(eventData?.activity?.id));
                this.cdr.detectChanges();
              });

              this.subscription = componentRef.instance.actionClickedForEdit.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                this.loadChildTasks(ganttInstance.taskStore.getById(eventData?.activity?.application_reference_id));
                this.cdr.detectChanges();
              });

              this.subscription = componentRef.instance.actionClickedForDelete.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                this.loadChildTasks(ganttInstance.taskStore.getById(eventData?.activity?.application_reference_id));
                this.cdr.detectChanges();
              });
            }
            else if (this.tab == "People"){
              this.subscription = componentRef.instance.actionClickedForCreate.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                let parentItem = ganttInstance.taskStore?.find((item: any) => item?.name == eventData?.newData?.assignedTo);
                this.loadChildTasks(parentItem);
                this.cdr.detectChanges();
              })

              this.subscription = componentRef.instance.actionClickedForEdit.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                let parentItem = ganttInstance.taskStore?.find((item: any) => item?.name == eventData?.newData?.assignedTo);
                this.loadChildTasks(parentItem);
                this.cdr.detectChanges();
              })

              this.subscription = componentRef.instance.actionClickedForDelete.subscribe((eventData: any) => {
                console.log(ganttInstance.project.taskStore.records.find(task => {
                  return task?.id === eventData?.activity?.id
                }))
                let parentItem = ganttInstance.taskStore?.find((item: any) => item?.name == eventData?.activity?.assigned_to);
                this.loadChildTasks(parentItem);
                this.cdr.detectChanges();
              })
            }
      
            container.appendChild(componentRef.location.nativeElement);
      
            componentRef.changeDetectorRef.detectChanges();
      
            return container;
        };
      }
    });

    const lockedSubgrids = document.querySelectorAll('[id^="b-gantt-"][id$="-lockedSubgrid"]');
    lockedSubgrids.forEach((el) => {
      this.renderer.setStyle(el, 'background-image', 'none');
    });

    const lockedSubgrids2 = document.querySelectorAll('[id^="b-gantt-"][id$="-normalSubgrid"]');
    lockedSubgrids2.forEach((el) => {
      this.renderer.setStyle(el, 'background-image', 'none');
    });
    const lockedSubgrids3 = document.querySelectorAll('[id^="bryntum-gantt-"][id$="-normalSubgrid"]');
    lockedSubgrids3.forEach((el) => {
      this.renderer.setStyle(el, 'background-image', 'none');
    });
    const lockedSubgrids4 = document.querySelectorAll('[id^="bryntum-gantt-"][id$="-lockedSubgrid"]');
    lockedSubgrids4.forEach((el) => {
      this.renderer.setStyle(el, 'background-image', 'none');
    });
    let tooltipElement = document.querySelector('.b-tooltip') as HTMLElement;
    tooltipElement.style.display = 'none';
    
  }

  loadUserProfileComponents() {
    const ganttInstance = this.ganttCmp.instance;
    const rows = ganttInstance.element.querySelectorAll('.user-profile-placeholder');
  
    rows.forEach((row: any) => {
      const userId = row.getAttribute('data-assigned-to');
  
      if (userId) {
        const viewContainerRef = this.getViewContainerRefForRow(row);
  
        const componentRef = viewContainerRef.createComponent(UserProfileComponent);
  
        componentRef.instance.oid = userId;
  
        row.innerHTML = ''; 
        row.appendChild(componentRef.location.nativeElement);
      }
    });
  }
  
  getViewContainerRefForRow(row: HTMLElement): ViewContainerRef {
    return this.viewContainerRef;
  }

  loadChildTasks(parentTask: any) {
    if (this.tab === "Opportunities"){
      this.isLoading = true;
      this.activitiesPlanningReportService.getActivitiesDataForGantt(this.tab, parentTask.id, this.startDateForData, this.endDateForData).subscribe((childTasks: any) => {
        this.isLoading = false;

        // this.ganttCmp.instance.taskStore.suspendEvents();

        parentTask.clearChildren(true);
        childTasks.messData = this.modifyTasksData(childTasks?.messData);

        childTasks.messData.forEach((childData: any) => {
            const childTask = this.ganttCmp.instance.taskStore.add(childData);
            parentTask.appendChild(childTask);
        });

        // this.ganttCmp.instance.taskStore.resumeEvents();

        this.clearAllFilters();

      });
    }
    else if (this.tab === "People"){
      this.isLoading = true;
      this.activitiesPlanningReportService.getActivitiesDataForGantt(this.tab, parentTask.name, this.startDateForData, this.endDateForData).subscribe((childTasks: any) => {
        this.isLoading = false;
        // parentTask.children = [];
        // childTasks = this.modifyTasksData(childTasks);
        // childTasks.messData.forEach((child: any) => {
        //   parentTask.appendChild(new this.ganttCmp.instance.taskStore.modelClass(child));
        // });
        // this.ganttCmp.instance.taskStore.suspendEvents();

        parentTask.clearChildren(true);
        childTasks.messData = this.modifyTasksData(childTasks?.messData);

        childTasks.messData.forEach((childData: any) => {
            const childTask = this.ganttCmp.instance.taskStore.add(childData);
            parentTask.appendChild(childTask);
        });

        // this.ganttCmp.instance.taskStore.resumeEvents();
        this.clearAllFilters();
      });
    }
  }

  renderUserProfile = ({ record }: { record: any }) => {
    return `<user-profile oid="${record.assigned_to}"></user-profile>`;
  };
  
  getData(){
    console.log('clicked getData');
  }

  onGanttReady(event: any){
    const gantt = event.source;

    gantt.on('taskClick', (taskEvent: any) => {
      const task = taskEvent.task;
      // this.openCustomTaskForm(task);
    });


  
    gantt.taskRenderer = ({ taskRecord }: { taskRecord: any }) => {
      return `<span style="padding-left: 5px; color: white;">${taskRecord.name}</span>`;
    };
  
    gantt.refresh();
    
  }

  handleButtonClick(record: any, action: string): void {
    switch (action) {
      case 'edit':
        break;
      case 'delete':
        break;
      default:
    }
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    const fieldsToSearch = ['name'];
    let parentIdArray: any[] = [];
    if (this.tab == 'Opportunities'){
      this.ganttCmp.instance.taskStore.forEach((record: any) => {
        if (record?.data?.is_activity !== 1 && record?.data?.is_activity !== true){
          if ((record?.data?.name).toLowerCase().includes(query.toLowerCase())){
            parentIdArray.push(record?.data?.id);
            return record?.data?.id;
          }
        }
        else{
          if ((record?.data?.name).toLowerCase().includes(query.toLowerCase())){
            parentIdArray.push(record?.data?.parentId);
            return record?.data?.parentId;
          }
        }
      })
      // this.ganttCmp.instance.taskStore.search(query, ['name'])
      // this.ganttCmp.instance.taskStore.filter({
      //   property: 'name',
      //   value: query,
      //   caseSensitive: false
      // });
      let tempArray : any[] = [];
      this.ganttCmp.instance.taskStore.clearFilters(true);
      this.ganttCmp.instance.taskStore.filterBy(
        (record: any) => {
          if(record?.data?.is_activity == 1 || record?.data?.is_activity == true){
            if (parentIdArray.includes(record?.data?.parentId)){
              tempArray.push(record);
              return true;
            }
            if((record?.data?.name).toLowerCase().includes(query.toLowerCase())){
              parentIdArray.push(record?.data?.parentId);
              tempArray.push(record);
              return true;
            }
          }
          else{
            if ((record?.data?.name).toLowerCase().includes(query.toLowerCase())){
              tempArray.push(record);
              return true;
            }
          }
          return false;
          
        }
      )
    }
    else if (this.tab == 'People'){
      // this.ganttCmp.instance.taskStore.forEach((record: any) => {
      //   if (record?.data?.is_activity !== 1 && record?.data?.is_activity !== true){
      //     if ((record?.data?.name).toLowerCase().includes(query.toLowerCase())){
      //       parentIdArray.push(record?.data?.id);
      //       return record?.data?.id;
      //     }
      //   }
      //   else{
      //     if ((record?.data?.name).toLowerCase().includes(query.toLowerCase())){
      //       parentIdArray.push(record?.data?.parentId);
      //       return record?.data?.parentId;
      //     }
      //   }
      // })
      let tempArray : any[] = [];
      this.ganttCmp.instance.taskStore.clearFilters(true);
      this.ganttCmp.instance.taskStore.filterBy(
        (record: any) => {
          if(record?.data?.is_activity == 1 || record?.data?.is_activity == true){
            if (parentIdArray.includes(record?.data?.parentId)){
              tempArray.push(record);
              return true;
            }
            if((record?.data?.name).toLowerCase().includes(query) || (record?.data?.opportunity_name).toLowerCase().includes(query)){
              parentIdArray.push(record?.data?.parentId);
              tempArray.push(record);
              return true;
            }
          }
          // else{
          //   if ((record?.data?.name).toLowerCase().includes(query) || (record?.data?.opportunity_name).toLowerCase().includes(query)){
          //     tempArray.push(record);
          //     return true;
          //   }
          // }
          return false;
          
        }
      )
    }
  }

  // onSearch(event: any) {
  //   const query = event.target.value.toLowerCase();
  //   const fieldsToSearch = ['name'];
  //   let parentIdArray: Set<any> = new Set();
    
  //   this.ganttCmp.instance.taskStore.forEach((record: any) => {
  //     if (record?.data?.is_activity === 1 || record?.data?.is_activity === true) {
  //       if ((record?.data?.name).toLowerCase().includes(query)) {
  //         parentIdArray.add(record?.data?.id);
  //       }
  //     }
  //   });
  
  
  //   const getAllChildren = (record: any) => {
  //     if (record.children) {
  //       record.children.forEach((child: any) => {
  //         parentIdArray.add(child.data.id);
  //         getAllChildren(child);
  //       });
  //     }
  //   };
  
  //   this.ganttCmp.instance.taskStore.forEach((record: any) => {
  //     if (parentIdArray.has(record?.data?.id)) {
  //       getAllChildren(record);
  //     }
  //   });
  
  
  //   this.ganttCmp.instance.taskStore.clearFilters(true);
  //   this.ganttCmp.instance.taskStore.filterBy((record: any) => {
  //     if (parentIdArray.has(record?.data?.id)) {
  //       return true;
  //     }
  //     return (record?.data?.name).toLowerCase().includes(query);
  //   });
  // }
  



  openPopover(origin: HTMLElement) {
    if (this.overlayRef) {
      this.closePopover();
      return;
    }

    const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(origin)
      .withPositions([
        { originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' }
      ]);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });

    const portal = new CdkPortal(this.popoverTemplate, this.viewContainerRef);

    this.overlayRef.attach(portal);

    this.overlayRef.backdropClick().subscribe(() => this.closePopover());
  }

  closePopover() {
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  changeYear(value: number) {
    this.currentYear += value;
  }

  selectMonth(index: number) {
    this.selectedMonthIndex = index;
    this.selectedYear = this.currentYear;
    this.startDateForData = moment({ year: this.selectedYear, month: this.selectedMonthIndex, day: 1 }).format('YYYY-MM-DD');
    this.endDateForData = moment({ year: this.selectedYear, month: this.selectedMonthIndex }).endOf('month').format('YYYY-MM-DD HH:mm:ss');
    this.scrollStartDate = moment(this.startDateForData).add(2, 'months').format('YYYY-MM-DD');
    this.isGanttRefreshRequired = true;
    let tempTab = this.tab;
    this.tab = undefined;
    this.tab = this.tab == 'Opportunities' ? 'People' : 'Opportunities';
    this.tab = tempTab;
    this.isRefreshNeeded = true;
    this.loadHeaderTasks();
    // if (this.tab == 'Opportunities'){
    //   this.changeTabToOpportunities()
    // }
    // else if (this.tab == 'People'){
    //   this.changeTabToPeople();
    // }
    this.cdr.detectChanges();
    this.isRefreshNeeded = false;
    this.closePopover();
  }

  
  toggleView(selectedView: string) {
    if (this.ganttCmp.instance.timeAxis.viewPreset.id !== selectedView) {
      this.ganttCmp.instance.viewPreset = selectedView;
    }
  }

  createTask(){
    // this.activitiesPlanningReportService.taskFormDetails(taskEvent.taskRecord.data?.id).then((res: any) => {
      const dialogRef = this.dialog.open(TabbedComponentComponent, {
        height: '87%',
        width: '45rem',
        maxHeight: 'fit-content',
        data:{
          tabbed_content_type: 4,
          customer_id: null,
          mode:"Create",
          application_reference_id: null,
          application_id: 36,
          masterData: this.masterOpportunitiesList
        }
      });
      dialogRef.afterClosed().subscribe(async (result: any) => {
        if (result?.text == "update required") {
          this.isGanttRefreshRequired = true;
          this.isRefreshNeeded = true;
          this.loadHeaderTasks();
          this.cdr.detectChanges();
          this.isRefreshNeeded = false;
        }
      })
    // });
  }

  changeTabToPeople(){
    if(this.tab == 'People'){
      return;
    }
    this.isGanttRefreshRequired = true;
    this.tab = 'People';
    this.loadHeaderTasks();
    this.cdr.detectChanges();
  }

  changeTabToOpportunities(){
    if(this.tab == 'Opportunities'){
      return;
    }
    this.isGanttRefreshRequired = true;
    this.tab = 'Opportunities';
    this.loadHeaderTasks();
    this.cdr.detectChanges();
  }
  
  updateColumns() {
    const ganttInstance = this.ganttCmp.instance;
    let columns: any[] = Array.isArray(ganttInstance.columns) ? ganttInstance.columns : (ganttInstance.columns as any)?.allRecords || [];
    columns.forEach((col: any) => {
      if (this.tab === "Opportunities" && col?.data?.field === 'assigned_to') {
        col.renderer = (value: any, task: any, column: any) => {
          if (value?.record?.data?.sales_activity_id !== undefined || value?.record?.data?.sales_activity_id != null) {
            const container = document.createElement('div');
            const componentRef = this.viewContainerRef.createComponent(UserProfileComponent, {
              injector: this.injector
            });
  
            componentRef.instance.oid = value?.record?.data?.assigned_to;
            componentRef.instance.type = 'small';
  
            container.appendChild(componentRef.location.nativeElement);
            componentRef.changeDetectorRef.detectChanges();
            return container;
          }
          return;
        };
      }
      else if (this.tab === "People" && col?.data?.field === 'name') {
        col.renderer = (value: any, task: any, column: any) => {
          if (value?.record?.data?.is_activity === 1 || value?.record?.data?.is_activity === true) {
            return value?.record?.data?.name;
          }
  
          const container = document.createElement('div');
          const componentRef = this.viewContainerRef.createComponent(UserProfileComponent, {
            injector: this.injector
          });
  
          componentRef.instance.oid = value?.value;
          componentRef.instance.type = 'small';
          container.appendChild(componentRef.location.nativeElement);
          componentRef.changeDetectorRef.detectChanges();
          return container;
        };
      }
      else if (col.data.text === 'Actions') {
        col.renderer = (value: any, task: any, column: any) => {
          const container = document.createElement('div');
          const componentRef = this.viewContainerRef.createComponent(MoreActionsComponent, {
            injector: this.injector
          });
  
          componentRef.instance.column = value?.record?.data;
          componentRef.instance.masterData = this.masterOpportunitiesList;
          container.appendChild(componentRef.location.nativeElement);
          componentRef.changeDetectorRef.detectChanges();
          return container;
        };
      }
    });
  }

  changeView(view: string, ganttInstance: any) {
    switch (view) {
      case 'day':
        PresetManager.registerPreset('customDayView', {
          base: 'hourAndDay',
          tickWidth: 35,
          headers: [
            { unit: 'day', dateFormat: 'ddd D MMM' },
            { unit: 'hour', dateFormat: 'HH' }
          ]
        });
        ganttInstance.preset = 'customDayView';
        break;
  
      case 'week':
        PresetManager.registerPreset('customWeekView', {
          base: 'weekAndDayLetter',
          tickWidth: 50,
          headers: [
            { unit: 'week', dateFormat: 'D MMM' },
            { unit: 'day', dateFormat: 'dd' }
          ]
        });
        ganttInstance.preset = 'customWeekView';
        break;
  
      case 'month':
        PresetManager.registerPreset('customMonthView', {
          base: 'monthAndYear',
          tickWidth: 80,
          headers: [
            { unit: 'month', dateFormat: 'MMM YYYY' },
            { unit: 'week', dateFormat: 'W' }
          ]
        });
        ganttInstance.preset = 'customMonthView';
        break;
    }
    ganttInstance.refresh();
  }

  zoomIn(ganttInstance: any) {
    if (ganttInstance) {
      ganttInstance.zoomIn();
    }
  }
  
  zoomOut(ganttInstance: any) {
    if (ganttInstance) {
      ganttInstance.zoomOut();
    }
  }

  toggleTaskNonWorkingTime(){
    this.showTaskNonWorkingtime = !this.showTaskNonWorkingtime;
    this.ganttCmp.instance.features.taskNonWorkingTime.disabled = this.showTaskNonWorkingtime;
    this.ganttCmp.instance.widgetMap['custom'].disabled = this.showTaskNonWorkingtime;
    this.ganttCmp.instance.widgetMap['mode'].disabled = this.showTaskNonWorkingtime;
  };

  backToReportsLandingPage(){
    // const url = `https://${this._tenantService.tenantInfo.tenant_domain}/main/reports`;
    const hostname = window.location.hostname;
    let url;
    if (hostname == 'localhost'){
      url = `https://kaarqual.kebs.app/main/reports`;
    }
    else{
      url = `https://${hostname}/main/reports`;
    }
    window.location.href = url;
  }

  routeToOpportunity(record: any){
    let opportunity_id = record?.data?.application_reference_id;
    if (opportunity_id){
      const hostname = window.location.hostname;
      let url;
      if (hostname == 'localhost'){
        url = `https://kaarqual.kebs.app/main/crm/opportunities/overview/${record?.data?.application_reference_id}`;
      }
      else{
        url = `https://${hostname}/main/crm/opportunities/overview/${record?.data?.application_reference_id}`;
      }
      // url = `https://kaarqual.kebs.app/main/crm/opportunities/overview/${record?.data?.application_reference_id}`;
      window.location.href = url;
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  showSnackBar(message: any, duration: any){
    this.snackBar.open(message, "Dismiss", { duration: duration });
  }

  getActivityStatusColor(activity_status_id: any, statusMasterData: any[]){
    {
      let status_id;
      let status_text ;
      let status_color;
      let status_text_color;
      for (let status in statusMasterData) {
        if (statusMasterData[status]['id'] === activity_status_id) {
          status_id = statusMasterData[status]['id'];
          status_text = statusMasterData[status]['statusText']
          status_color = statusMasterData[status]['statusColorId']
          status_text_color = statusMasterData[status]['statusTextColorId']
        }
      }
      let cellParams =
      {  
        statusId: status_id,
        statusText: status_text,
        statusColor: status_color,
        statusTextColor: status_text_color
      }
      return cellParams;
    }
  }

  initializeSlicerData(data: any){
    this.slicerData = this.activitiesPlanningReportService.slicerData;
    this.filterConfig = this.activitiesPlanningReportService.filterConfigService;
    let seenSbu = new Set<string>();
    let seenBu = new Set<string>();
    let seenSo = new Set<string>();
    let seenOwner = new Set<string>();

    this.sbuArray = [];
    this.buArray = [];
    this.soArray = [];
    this.ownerArray = [];

    data.forEach((item: any) => {
      item?.children?.forEach((child: any) => {
        const sbu = child?.sbu;
        if (sbu && !seenSbu.has(sbu)) {
          seenSbu.add(sbu);
          this.sbuArray.push({ name: sbu, isClicked: true, isSelected: false });
        }
      });
    });

    data.forEach((item: any) => {
      item?.children?.forEach((child: any) => {
        const bu = child?.bu;
        if (bu && !seenBu.has(bu)) {
          seenBu.add(bu);
          this.buArray.push({ name: bu, isClicked: true, isSelected: false });
        }
      });
    });

    data.forEach((item: any) => {
      item?.children?.forEach((child: any) => {
        const so = child?.sales_unit_name;
        if (so && !seenSo.has(so)) {
          seenSo.add(so);
          this.soArray.push({ name: so, isClicked: true, isSelected: false });
        }
      });
    });

    data.forEach((item: any) => {
      item?.children?.forEach((child: any) => {
        const owner = child?.sales_owner_name;
        if (owner && !seenOwner.has(owner)) {
          seenOwner.add(owner);
          this.ownerArray.push({ name: owner, isClicked: true, isSelected: false });
        }
      });
    });
    
    this.sbuMain = this.sbuArray;
    this.buMain = this.buArray;
    this.soMain = this.soArray;
    this.ownerMain = this.ownerArray;

    this.isSlicerLoading = false;

    this.slicerData = {
      SBU: this.sbuArray,
      BU: this.buArray,
      Owner: this.ownerArray,
      SO: this.soArray
    };
    this.filterConfig = {
      SBU: this.sbuFilter,
      BU: this.buFilter,
      Owner: this.ownerFilter,
      SO: this.salesOrgFilter
    }
    this.activitiesPlanningReportService.slicerData = this.slicerData;
    this.activitiesPlanningReportService.filterConfigService = this.filterConfig;
    // this.applyFilter();
  }

  async handleCombinedEvent(event: { selectedItem: { name: string, isClicked: boolean, isSelected: boolean }, slicerName: string }) {  
    this.selectedItem = event.selectedItem;
    this.selectedItem['isSelected'] = !this.selectedItem['isSelected'];
    this.slicerName = event.slicerName;
    switch (this.slicerName) {
      case 'SBU':
        this.updateLevelFilter('sbu', this.selectedItem);
        break;
      case 'BU':
        this.updateLevelFilter('bu', this.selectedItem);
        break;
      case 'Owner':
        this.updateLevelFilter('sales_owner_name', this.selectedItem);
        break;
      case 'SO':
        this.updateLevelFilter('sales_unit_name', this.selectedItem);
        break; 
      default:
        console.log("no such slicer");
        break;
    }
    this.selectedItem['isClicked'] = !this.selectedItem['isClicked'];
    this.sbuFilter = _.contains(_.keys(this.filterModel),"sbu")
    this.buFilter = _.contains(_.keys(this.filterModel),"bu")
    this.ownerFilter = _.contains(_.keys(this.filterModel),"sales_owner_name")
    this.salesOrgFilter = _.contains(_.keys(this.filterModel),"sales_unit_name")
    this.filterConfig = {
      SBU:this.sbuFilter,
      BU: this.buFilter,
      Owner: this.ownerFilter,
      SO: this.salesOrgFilter
    }
    // this.slicerData = {
    //   SBU: this.sbuArray,
    //   BU: this.buArray,
    //   Owner: this.ownerArray,
    //   SO: this.soArray
    // };
    this.activitiesPlanningReportService.filterConfigService = this.filterConfig;
    this.applyFilter(); 
  }

  updateLevelFilter(filterKey: string, item: any) {
    if (item && item.isSelected) {
      this.filterModel[filterKey] = { filterType: 'set', values: [item.name] };
    } else {
      delete this.filterModel[filterKey];
    }
  }

  updateSlicerArrays(filteredData: any) {
    this.updateallSlicerArrays()
    let sbuSet: any = [];
    let buSet: any = [];
    let ownerSet: any = [];
    let soSet: any = [];
    filteredData.forEach((data: any) => {
      data?.children?.forEach((child: any) => {
        sbuSet.push(child?.data?.sbu);
        buSet.push(child?.data?.bu);
        ownerSet.push(child?.data?.sales_owner_name);
        soSet.push(child?.data?.sales_unit_name);
      });
    });
    sbuSet = new Set(sbuSet);
    buSet = new Set(buSet);
    ownerSet = new Set(ownerSet);
    soSet = new Set(soSet);
    this.updateHighlightedItems(this.sbuArray, sbuSet);
    this.updateHighlightedItems(this.buArray, buSet);
    this.updateHighlightedItems(this.ownerArray, ownerSet);
    this.updateHighlightedItems(this.soArray, soSet);
    this.sbuArray = _.sortBy(this.sbuArray, function (item) {
      return !item.isClicked;
    });
    this.buArray = _.sortBy(this.buArray, function (item) {
      return !item.isClicked;
    });

    this.ownerArray = _.sortBy(this.ownerArray, function (item) {
      return !item.isClicked;
    });
    this.soArray = _.sortBy(this.soArray, function (item) {
      return !item.isClicked;
    });
    this.slicerData = {
      SBU: this.sbuArray,
      BU: this.buArray,
      Owner: this.ownerArray,
      SO: this.soArray
    };
    this.activitiesPlanningReportService.slicerData = this.slicerData;
    this.checkIfResetButtonPresent();
  }

  updateallSlicerArrays() {
    const keysToUpdate = ['SBU', 'BU', 'SO', 'Owner'];

    keysToUpdate.forEach(key => {
      const slicerArray = this.slicerData[key];

      const arrayKey = `${key.toLowerCase()}Array` as keyof this;
      const originalArray = this[arrayKey] as any[];
      if (slicerArray && Array.isArray(originalArray)) {
        this[arrayKey] = slicerArray.map((slicerItem: any) => {
          const match = originalArray.find(
            (originalItem: any) => originalItem.name === slicerItem.name
          );
          return match
            ? { ...match, isClicked: slicerItem.isClicked, isSelected: slicerItem.isSelected }
            : slicerItem;
        }) as any;
      }
    });
  }

  updateHighlightedItems(initialArray: any, filteredSet: any) {
    initialArray.forEach((item: any) => {
      item.isClicked = filteredSet.has(item.name);
    });
  }

  applyFilter() {
    this.ganttCmp.instance.taskStore.clearFilters();
    for (let key in this.filterModel) {
      this.ganttCmp.instance.taskStore.filterBy(
        (record: any) => {
          if(record?.data?.is_activity == 1 || record?.data?.is_activity == true){
            if (this.filterModel[key].filterType === 'set') {
              if (this.filterModel[key].values.includes(record?.data?.[key])) {
                return true;
              }
            } 
          }
          return;
          // return true;
        }
      )
    }
    this.updateSlicerArrays(this.ganttCmp?.instance?.taskStore.records);

  }

  clearSlicer(event: { slicerName: string }) {
    const sname = event.slicerName;
    switch (sname) {
      case 'SBU':
        this.sbuArray.forEach(item => item.isSelected = false);
        this.updateLevelFilter('sbu', null);
        this.sbuArray = [...this.sbuMain];
        delete this.filterModel["sbu"];
        this.sbuFilter = false
        break;
      case 'BU':
        this.buArray.forEach(item => item.isSelected = false);
        this.updateLevelFilter('bu', null);
        this.buArray = [...this.buMain];
        delete this.filterModel["bu"];
        this.buFilter = false
        break;
      case 'Owner':
        this.ownerArray.forEach(item => item.isSelected = false);
        this.updateLevelFilter('sales_owner_name', null);
        this.ownerArray = [...this.ownerMain];
        delete this.filterModel["sales_owner_name"];
        this.ownerFilter = false
        break;
      case 'SO':
        this.soArray.forEach(item => item.isSelected = false);
        this.updateLevelFilter('sales_unit_name', null);
        this.soArray = [...this.soMain];
        delete this.filterModel["sales_unit_name"];
        this.salesOrgFilter = false
        break;
      default:
        console.log("no such slicer");
        break;
    }
    this.applyFilter();
    this.filterConfig = {
      SBU:this.sbuFilter,
      BU: this.buFilter,
      Owner: this.ownerFilter,
      SO: this.salesOrgFilter
    }
    if (JSON.stringify(this.filterModel) === '{}') {
      this.isResetButtonPresent = false;
    }
    this.updateSlicerArrays(this.ganttCmp?.instance?.taskStore.records);
  }

  supressSlicer() {
    this.isSlicerOn = !this.isSlicerOn;
  }

  clearAllFilters() {
    this.ganttCmp.instance.taskStore.clearFilters();
    this.slicerData = JSON.parse(JSON.stringify(this.activitiesPlanningReportService.slicerData));
    this.filterModel = {};
    
    let seenSbu = new Set<string>();
    let seenBu = new Set<string>();
    let seenSo = new Set<string>();
    let seenOwner = new Set<string>();

    this.sbuArray = [];
    this.buArray = [];
    this.soArray = [];
    this.ownerArray = [];

    this.ganttCmp?.instance?.taskStore.records.forEach(parent => {
      parent.allChildren.forEach(child => {
        const sbu = child?.getData("sbu");
        const bu = child?.getData("bu");
        const so = child?.getData("sales_unit_name");
        const owner = child?.getData("sales_owner_name");

        if (sbu && !seenSbu.has(sbu)) {
          seenSbu.add(sbu);
          this.sbuArray.push({ name: sbu, isClicked: true, isSelected: false });
        }
        if (bu && !seenBu.has(bu)) {
          seenBu.add(bu);
          this.buArray.push({ name: bu, isClicked: true, isSelected: false });
        }
        if (so && !seenSo.has(so)) {
          seenSo.add(so);
          this.soArray.push({ name: so, isClicked: true, isSelected: false });
        }
        if (owner && !seenOwner.has(owner)) {
          seenOwner.add(owner);
          this.ownerArray.push({ name: owner, isClicked: true, isSelected: false });
        }

      })
    });

    this.sbuMain = this.sbuArray;
    this.buMain = this.buArray;
    this.ownerMain = this.ownerArray;
    this.soMain = this.soArray;
    this.slicerData = {
      SBU: this.sbuArray,
      BU: this.buArray,
      Owner: this.ownerArray,
      SO: this.soArray
    }; 
    this.sbuFilter = _.contains(_.keys(this.filterModel),"sbu")
    this.buFilter = _.contains(_.keys(this.filterModel),"bu")
    this.ownerFilter = _.contains(_.keys(this.filterModel),"sales_owner_name")
    this.salesOrgFilter = _.contains(_.keys(this.filterModel),"sales_unit_name")
    this.filterConfig = {
      SBU:this.sbuFilter,
      BU: this.buFilter,
      Owner: this.ownerFilter,
      SO: this.salesOrgFilter
    }
    this.activitiesPlanningReportService.filterConfigService = this.filterConfig;
    this.activitiesPlanningReportService.slicerData = this.slicerData;
    this.isResetButtonPresent = false;
  }

  checkIfResetButtonPresent(){
    this.isResetButtonPresent = Object.keys(this.slicerData).some(key =>
      this.slicerData[key].some((item: any) => item?.isSelected === true)
    );
  }

  onDateRangeChange() {
    this.startDateForData = moment(this.startDateForData).format('YYYY-MM-DD');
    this.endDateForData = moment(this.endDateForData).format('YYYY-MM-DD HH:mm:ss');
  }

  openStartPicker(event: MouseEvent) {
    const input = this.startInput.nativeElement;
    input.style.top = `${event.clientY}px`;
    input.style.left = `${event.clientX}px`;
    input.style.position = 'fixed';

    this.startPicker.open();
  }

  openEndPicker(event: MouseEvent) {
    const input = this.endInput.nativeElement;
    input.style.top = `${event.clientY}px`;
    input.style.left = `${event.clientX}px`;
    input.style.position = 'fixed';

    this.endPicker.open();
  }

  onStartDateChange(event: MatDatepickerInputEvent<Date>) {
    this.startDateForData = moment(event.value).format('YYYY-MM-DD');
    this.scrollStartDate = moment(this.startDateForData).add(2, 'months').format('YYYY-MM-DD');
    this.isGanttRefreshRequired = true;
    let tempTab = this.tab;
    this.tab = undefined;
    this.tab = this.tab == 'Opportunities' ? 'People' : 'Opportunities';
    this.tab = tempTab;
    this.isRefreshNeeded = true;
    this.loadHeaderTasks();
    this.cdr.detectChanges();
    this.isRefreshNeeded = false;

  }

  onEndDateChange(event: MatDatepickerInputEvent<Date>) {
    this.endDateForData = moment(event.value).format('YYYY-MM-DD HH:mm:ss');
    this.scrollStartDate = moment(this.startDateForData).add(2, 'months').format('YYYY-MM-DD');
    this.isGanttRefreshRequired = true;
    let tempTab = this.tab;
    this.tab = undefined;
    this.tab = this.tab == 'Opportunities' ? 'People' : 'Opportunities';
    this.tab = tempTab;
    this.isRefreshNeeded = true;
    this.loadHeaderTasks();
    this.cdr.detectChanges();
    this.isRefreshNeeded = false;
  }


}
