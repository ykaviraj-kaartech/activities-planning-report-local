import { Component, OnInit, Input } from '@angular/core';
import { ActivitiesPlanningReportService } from '../../service/activities-planning-report.service';



@Component({
  selector: "app-user-image",
  templateUrl: "./user-image.component.html",
  styleUrls: ["./user-image.component.scss"]
})

export class UserImageComponent implements OnInit {
  imgSrc: any = 'assets/images/User.png';
  imageList: any = {};
  @Input() id: string | undefined;
  @Input() imgWidth: string = '37px';
  @Input() imgHeight: string = '37px';
  @Input() borderWidth: String = '0px';
  @Input() borderStyle: String = 'solid';
  @Input() borderColor: string = '#000000';
  constructor(private activitiesPlanningReportService: ActivitiesPlanningReportService) { }

  async ngOnInit() { }

  async ngOnChanges() {
    try {
      if (this.id) {
        if (this.imageList[this.id]) this.imgSrc = this.imageList[this.id];
        else {
          let imageUrl = await this.activitiesPlanningReportService.getUserProfileImage(this.id) as any; 
          if (imageUrl == null || imageUrl?.err == true) {
            this.imgSrc = 'assets/images/User.png';
          } else {
            if(imageUrl?.data?.profile_image_url == null || imageUrl?.data?.profile_image_url == undefined){
              this.imgSrc = 'assets/images/User.png';
            }
            else{
              this.imgSrc = imageUrl?.data?.profile_image_url
            }

            this.imageList[this.id] = this.imgSrc;
          }
        }
      } else this.imgSrc = 'assets/images/User.png';
    } catch (err) {
      this.imgSrc = 'assets/images/User.png';
      if (this.id) {
        this.imageList[this.id] = this.imgSrc;
      }
    }
  }
}

