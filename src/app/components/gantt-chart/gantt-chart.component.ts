import { Component, ViewChild, AfterViewInit, ViewContainerRef, ElementRef, ChangeDetectorRef, ApplicationRef, Injector, EnvironmentInjector, ComponentFactoryResolver } from '@angular/core';
// import ganttProps from '.gantt.config';
import { BryntumGanttComponent } from '@bryntum/gantt-angular';
import { CalendarModel, Gantt, ProjectModel, StringHelper, TaskModel } from '@bryntum/gantt';
import { ActivitiesPlanningReportService } from '../../service/activities-planning-report.service';
import { UserProfileComponent } from '../user-profile/user-profile.component'
import { MoreActionsComponent } from '../more-actions/more-actions.component'
import { withDebugTracing } from '@angular/router';
import { DateHelper, Toast } from '@bryntum/gantt';



@Component({
  selector: 'app-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrl: './gantt-chart.component.scss'
})
export class GanttChartComponent {
  @ViewChild('gantt', { static: false }) ganttCmp!: BryntumGanttComponent;
  
  ganttProps: any;
  tab: any = "Opportunities"; // Opportunities, People

  constructor(
    private activitiesPlanningReportService: ActivitiesPlanningReportService,
    private viewContainerRef: ViewContainerRef,
    private injector: Injector,
    private appRef: ApplicationRef,
  ) {}

  ngOnInit() {
    this.loadHeaderTasks();
  }

  modifyTasksData(tasks: any[]) {
    return tasks.map(task => ({
        ...task,
        manuallyScheduled: true,
        constraintDate: null
    }));
  }

  loadHeaderTasks() {
    if (this.tab === "Opportunities"){
      this.activitiesPlanningReportService.getActivitiesDataForGanttForId(this.tab, 36).subscribe((tasks: any) => {
        this.ganttProps = {
          project: {
            autoLoad: true,
            tasksData: this.modifyTasksData(tasks.messData),
            manuallyScheduled: true,
          },
          startDate : '2009-01-12',
          endDate : '2029-03-24',
          features: {
            projectLines: false,
          },
          columns: [
            { type: 'name', text: 'Task Name', field: 'name', width: 250,
              renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                cellElement.style.borderRight = 'none';
                return record.name;
              }
            },
            { text: 'Assigned To', field: 'assigned_to', htmlEncode: false, width: 200,
              renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                cellElement.style.borderRight = 'none';
                return `<div class="user-profile-placeholder" data-assigned-to="${record.assigned_to}"></div>`;
              }
            },
            { text: 'Actions', width: 50, 
              
            }
          ],
          listeners: {
            beforeExpand: ({ record }: { record: any }) => {
              console.log('in listeners', record);
              if (!record.children.length) {
                this.loadChildTasks(record);
              }
            }
          }
        };
      });
    }
    else if (this.tab === "People"){
      this.activitiesPlanningReportService.getActivitiesDataForGanttForId(this.tab, 36).subscribe((tasks: any) => {
        this.ganttProps = {
          project: {
            autoLoad: true,
            tasksData: tasks.messData,
          },
          startDate : '2009-01-12',
          endDate : '2029-03-24',
          features: {
            projectLines: false
          },
          columns: [
            {
              type: 'tree', text: 'Expand', width: 25
            },
            { type: 'name', text: 'Person', field: 'name', width: 250,
              renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                console.log('---record', record);
                console.log('---cellElement', cellElement);
                cellElement.style.borderRight = 'none';
                return `<div class="user-profile-placeholder" data-assigned-to="${record.name}"></div>`
              }
            },
            { text: 'Opportunity Name', field: 'opportunity_name', htmlEncode: false, width: 200,
              renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                cellElement.style.borderRight = 'none';
                return record.opportunity_name;
              }
            },
            { text: 'End Date', field: 'end_date', htmlEncode: false, width: 200,
              renderer: ({ record, cellElement }: { record: any, cellElement: HTMLElement }) => {
                cellElement.style.borderRight = 'none';
                return record.end_date;
              }
            },
            { text: 'Actions', width: 50, 
              
            }
          ],
          listeners: {
            beforeExpand: ({ record }: { record: any }) => {
              console.log('in listeners', record);
              if (!record.children.length) {
                this.loadChildTasks(record);
              }
            },
            taskresize: ({ taskRecord }: any) => {
              console.log('Task resized:', taskRecord.name, 'New start:', taskRecord.startDate, 'New end:', taskRecord.endDate);
            },
            taskdrag: ({ taskRecord }: any) => {
              console.log('Task dragged:', taskRecord.name);
            }
          }
        };
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
    console.log('inside ngAfterViewInit', ganttInstance);
    ganttInstance.taskStore.on('taskResizeEnd', ({ changed, taskRecord, resizeData }: {changed: any, taskRecord: any, resizeData: any}) => { 
      console.log('changed', changed);
      console.log('taskRecord', taskRecord);
      console.log('resizeData', resizeData);
    });
    ganttInstance.taskStore.on('add', (event: any) => {
      const record = event.source;
      console.log('Task expanded:', record);
      console.log('Task expanded: event', event);
  
      if (!record.children || record.children.length === 0) {
        console.log('record', record);
        this.loadChildTasks(event.parent);
      }
    });
    ganttInstance.on('event', ({ event, params }: {event: any, params: any}) => {
      console.log('--------------------------------------------------');
      console.log('Event triggered:', event, params);
      console.log('--------------------------------------------------');
  });

  ganttInstance.project.taskStore.on('update', ({ record, changes }: { record: TaskModel, changes: any }) => {
    if ((record as any).data.is_activity == true){
      console.log(`Task record`, record);
      console.log(`Task "${record.name}" was updated.`);
      console.log('Changed fields:', changes);
      console.log('Changed record fields:', record);
  
      if (changes.duration) {
          console.log(`New Duration: ${record.duration}`);
      }
  
      if (changes.startDate || changes.endDate) {
        console.log(`New Start Date: ${record.startDate}, End Date: ${record.endDate}`);
        // this.activitiesPlanningReportService.updateActivityDates((record as any).data.id, record.startDate, record.endDate).subscribe((task: any) => {
        //   console.log('task after updating date', task.messData);
        // });
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
      console.log(`Task "${record.name}" was expanded.`);
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
      
            container.appendChild(componentRef.location.nativeElement);
      
            componentRef.changeDetectorRef.detectChanges();
      
            return container;
          }
          return;
        };
      }
      else if (this.tab === "People" && col.data.field === 'name') {
        col.renderer = (value: any, task: any, column: any) => {
            
            const container = document.createElement('div');
      
            const componentRef = this.viewContainerRef.createComponent(UserProfileComponent, {
              injector: this.injector
            });

            componentRef.instance.oid = value?.value;
      
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
      
            container.appendChild(componentRef.location.nativeElement);
      
            componentRef.changeDetectorRef.detectChanges();
      
            return container;
        };
      }
    });
    
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
    console.log('parentTask', parentTask);
    if (this.tab === "Opportunities"){
      this.activitiesPlanningReportService.getActivitiesDataForGantt(this.tab, parentTask.id).subscribe((childTasks: any) => {
        // parentTask.clearChildren(false);

        this.ganttCmp.instance.taskStore.suspendEvents();

        parentTask.clearChildren(true);

        childTasks.messData.forEach((childData: any) => {
            const childTask = this.ganttCmp.instance.taskStore.add(childData);
            parentTask.appendChild(childTask);
        });

        this.ganttCmp.instance.taskStore.resumeEvents();

        // parentTask.appendChild(childTasks.messData);
      });
    }
    else if (this.tab === "People"){
      this.activitiesPlanningReportService.getActivitiesDataForGantt(this.tab, parentTask.name).subscribe((childTasks: any) => {
        parentTask.children = [];
        // parentTask.appendChild(childTasks.messData);
        childTasks.messData.forEach((child: any) => {
          parentTask.appendChild(new this.ganttCmp.instance.taskStore.modelClass(child));
        });
      });
    }
  }

  renderUserProfile = ({ record }: { record: any }) => {
    return `<user-profile oid="${record.assigned_to}"></user-profile>`;
  };

  consoleData(){
    console.log('this.ganttProps', this.ganttProps);
    console.log('this.ganttCmp', this.ganttCmp);
    console.log('this.ganttCmp.instance', this.ganttCmp.instance);
    console.log('this.ganttCmp.instance.taskStore', this.ganttCmp.instance.taskStore);
  }
  
  getData(){
    console.log('clicked getData');
  }

  onGanttReady(e: any){
    console.log('onGanttReady');
  }

  handleButtonClick(record: any, action: string): void {
    console.log(`${action} clicked for record`, record);
    switch (action) {
      case 'edit':
        console.log('edit record', record);
        break;
      case 'delete':
        console.log('create record', record);
        break;
      default:
        console.log(`Unknown action: ${action}`);
    }
  }


  



}
