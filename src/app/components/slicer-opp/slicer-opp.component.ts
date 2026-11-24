import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import {CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray} from '@angular/cdk/drag-drop';
import { ActivitiesPlanningReportService } from '../../service/activities-planning-report.service';
@Component({
  selector: 'app-slicer-opp',
  templateUrl: './slicer-opp.component.html',
  styleUrls: ['./slicer-opp.component.scss']
})
export class SlicerOppComponent implements OnInit, OnChanges {
   @Input() slicerData: { [key: string]: any[] } = {};
   @Input() filterConfig: any = {};
   @Output() combinedEvent = new EventEmitter<{ selectedItem: { name: string, isClicked: boolean, isSelected: boolean }, slicerName: string }>();
   @Output() clearSlicer = new EventEmitter<{ slicerName: string }>(); 
   slicerNames: any[] = [];
   searchStates: { [key: string]: boolean } = {};
   originalSlicerData: { [key: string]: any[] } = {};
 
    constructor(
     private activitiesPlanningReportService: ActivitiesPlanningReportService,
    ) { }
  
    ngOnInit(): void {
      const desiredOrder = ['SBU', 'BU', 'SO', 'Owner', 'Status', 'Presales Status', 'ClosureDate', 'SubmissionDate'];
    
      const hasKanbanSlicerData = this.activitiesPlanningReportService.slicerData &&
        Object.keys(this.activitiesPlanningReportService.slicerData).length > 0;
    
      const rawSlicerData = hasKanbanSlicerData ? 
      this.activitiesPlanningReportService.slicerData 
      : this.slicerData;
    
      const orderedData: any = {};
      desiredOrder.forEach(key => {
        if (rawSlicerData.hasOwnProperty(key)) {
          orderedData[key] = rawSlicerData[key];
        }
      });
      this.slicerData = orderedData;
      this.slicerNames = Object.keys(this.slicerData);
    
    }    
    slicerFilter(item : any, sname: any){
      this.combinedEvent.emit({ selectedItem: item, slicerName: sname });
    }
    moveItemToFront = (array: any, selectedItem: any) => {
      const index = array.indexOf(selectedItem);
      if (index > -1) {
        array.splice(index, 1);
        array.unshift(selectedItem);
      }
      return array;
    }
    drop(event: CdkDragDrop<string[]>) {
      moveItemInArray(this.slicerNames, event.previousIndex, event.currentIndex);
    }
    clearSlicerFunc(slicerName: any){
      this.clearSlicer.emit({ slicerName:  slicerName})
    }
 
    toggleSearchInput(slicerTitle: string){
     this.searchStates[slicerTitle] = !this.searchStates[slicerTitle];
   }
 
  //  searchEvent(event: Event, slicerTitle: string): void {
  //   const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
  //   if (!searchValue) {
  //     this.slicerData[slicerTitle] = JSON.parse(JSON.stringify(this.activitiesPlanningReportService.slicerData[slicerTitle]));
  //   } else {
  //     // const originalData = this.activitiesPlanningReportService.slicerData[slicerTitle].map((item: any) => ({ ...item }));
  //     // const filteredData = originalData.filter((item: any) =>
  //     //   item?.name?.toLowerCase().includes(searchValue)
  //     // );
  //     // const filteredData = this.activitiesPlanningReportService.slicerData[slicerTitle].filter((item: any) =>
  //     //   item?.name?.toLowerCase().includes(searchValue)
  //     // );
  //     const originalData = this.activitiesPlanningReportService.slicerData;
  //     const filteredData = originalData.filter((item: any) =>
  //       item?.name?.toLowerCase().includes(searchValue)
  //     );
  //     this.slicerData[slicerTitle] = filteredData;
  //   }
  //  }  

  searchEvent(event: Event, slicerTitle: string): void {
    const searchValue = (event.target as HTMLInputElement).value.toLowerCase();
  
    const serviceSlice = this.activitiesPlanningReportService.slicerData[slicerTitle];
  
    if (!searchValue) {
      this.slicerData[slicerTitle] = [...serviceSlice];
    } else {
      this.slicerData = {
        ...this.activitiesPlanningReportService.slicerData,
        [slicerTitle]: serviceSlice
          .filter((item: any) => item?.name?.toLowerCase().includes(searchValue))
      };
    }
  }
  
  
    ngOnChanges(changes: any){
      // if (changes['slicerData'] || changes['filterConfig']) {
      //   this.refreshSlicerDataFromService();
      // }
    }

    refreshSlicerDataFromService() {
      this.slicerData = JSON.parse(JSON.stringify(this.activitiesPlanningReportService.slicerData));
    }

  }