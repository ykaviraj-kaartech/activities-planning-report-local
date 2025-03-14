import { Component, OnInit, Input, EventEmitter, Output } from "@angular/core";
// import { GraphApiService } from "../../../../../services/graph/graph-api.service";
// import { AccountsService } from "../../../features/accounts/services/accounts.service";
import { ActivitiesPlanningReportService } from '../../service/activities-planning-report.service';

// import { MatSnackBar } from "@angular/material/snack-bar";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.scss"]
})
export class UserProfileComponent implements OnInit {
  @Input() type: any;
  profile: any = {};
  @Input() oid: any | undefined;
  @Input() role: string | undefined;
  @Input() stakeholder_id: string | undefined;
  @Input() project_id: string | undefined;
  @Input() item_id: string | undefined;
  newData: any;
  @Output() refreshList: EventEmitter<any> = new EventEmitter<any>();
  constructor(
    // private graphApi: GraphApiService,
    // private accountService: AccountsService,
    // private snackBar: MatSnackBar,
    private activitiesPlanningReportService: ActivitiesPlanningReportService
  ) { }

  ngOnInit() {
    this.oid = this.oid;
    this.type = 'small';
    this.getUserProfile();
   }
  ngOnChanges() {
    this.oid = this.oid;
    this.type = 'small';
    this.getUserProfile();
  }

  async getUserProfile() {
    if (this.oid)
      try {
        let userProfile = await this.getUserProfileFromDB(this.oid);
        this.profile = userProfile;

        // let temp = await this.graphApi.getUserProfile(this.oid);
        // if(temp) {
        //   this.profile = temp;
        // }
        // else {
        //   console.log(temp);
        //   let userProfile = await this.getUserProfileFromDB(this.oid);
        //   this.profile = userProfile;
        // }
      } catch (err) { }
    else this.profile = {};
  }

  async getUserProfileFromDB(oid: any) {
    let temp = await this.activitiesPlanningReportService.getUserProfileFromDB(oid);
    
    if (Array.isArray(temp) && temp.length > 0) {
      return temp[0]; // Now TypeScript knows it's an array
    } else {
      return "";
    }
}


  //remove member 


  // removeMember() {
  //   try {
  //     this.accountService.removeMember(this.stakeholder_id).then(
  //       (        res: any) => {
  //         this.refreshList.emit();
  //         this.snackBar.open("Member Removed.", "Dismiss", {
  //           duration: 2000
  //         });
  //       },
  //       (        err: any) => {
  //         console.log(err);
  //       }
  //     );
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }
}
