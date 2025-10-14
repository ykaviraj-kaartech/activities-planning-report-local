import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  forwardRef,
  AfterViewInit,
  OnDestroy
} from "@angular/core";
import { Subject } from "rxjs";
import { debounceTime, takeUntil } from "rxjs/operators";
import {
  FormControl,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor
} from "@angular/forms";
import { BaseControlValueAccessor } from "../../interceptor/ControlValueAccessor";
import { ActivitiesPlanningReportService } from '../../service/activities-planning-report.service';

@Component({
  selector: "app-search-user",
  templateUrl: "./search-user.component.html",
  styleUrls: ["./search-user.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchUserComponent),
      multi: true
    }
  ]
})
export class SearchUserComponent extends BaseControlValueAccessor<any>
  implements ControlValueAccessor, OnInit, OnDestroy {
  userSearchSubject: Subject<string> = new Subject();
  @Input() isAutocomplete: boolean = false;
  @Input() Formwidth: any = "";
  @Output() showUserList = new EventEmitter();
  @Output() selectedUser = new EventEmitter();
  @Input() label: string = "";
  @Output() blur = new EventEmitter();
  @Input() required: boolean = false;
  public fieldCtrl: FormControl = new FormControl();
  @Input() override disabled: any = false;
  @Input() readonly: any = false;
  @Input() isGraphApi: any = 0;
  @Input() isLcdp: boolean = false;
  @Input() isLabelDisplay: boolean = true
  optClicked:boolean=false;
  text: any;
  protected _onDestroy = new Subject<void>();

  constructor(
    public activitiesPlanningReportService: ActivitiesPlanningReportService
  ) {
    super();
  }

  ngOnInit() {
    this.userSearchSubject
      .pipe(debounceTime(600))
      .subscribe(async searchTextValue => {
        console.log(searchTextValue);
        if (this.isGraphApi) {
          this.activitiesPlanningReportService
            .getUserSuggestions(searchTextValue)
            .then(async (data: any) => {
              if (data && data.length > 0) {
                this.showUserList.emit(data)
              }
              else {
                let temp = await this.getUserSuggestionsFromDB(searchTextValue);
                this.showUserList.emit(temp)
              }
            },
              async (err: any) => {
                console.log(err);
                let temp = await this.getUserSuggestionsFromDB(searchTextValue);
                this.showUserList.emit(temp)
              });
        }
        else {
          let temp = await this.getUserSuggestionsFromDB(searchTextValue);
          this.showUserList.emit(temp)
        }


      });

    this.fieldCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(val => {
        if (val) {
          this.value = val.id;
          this.onChange(val.id);
        } else {
          this.value = "";
          this.onChange("");
        }
      });
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  ngAfterViewInit() { }

  searchUser(event: any): any {
    this.text = event.target.value;
    if(event.key == "Enter"){this.optClicked=true;}
    else{this.optClicked=false;}
    if (!this.text) return (this.activitiesPlanningReportService.userSuggestions = []);
    this.userSearchSubject.next(this.text);
  }

  resetSuggestion() {
    this.activitiesPlanningReportService.userSuggestions = [];
  }
  checkAndClearInput() {
        if(!this.optClicked && this.readonly == false)
           this.fieldCtrl.setValue("")
      
     }

  selectedOption(evt: any) {
    this.optClicked=true;
    this.selectedUser.emit(evt.option.value);
    this.value = evt.option.value;
    this.blur.emit();
  }

  displayUserName(user: any) {
    return user ? user.displayName : "";
  }

  override setDisabledState(isDisabled: boolean) {
    if (isDisabled) this.fieldCtrl.disable();
    else this.fieldCtrl.enable();
  }

  override async writeValue(value: any) {
    if (value) {

      if (this.isGraphApi) {
        this.activitiesPlanningReportService.getUserProfile(value).then(async (res: any) => {
          if (res) {
            this.fieldCtrl.setValue(res);
          }
          else {
            let temp = await this.getUserProfileFromDB(value);
            this.fieldCtrl.setValue(temp);
          }
        },
        async (err: any) => {
          let temp = await this.getUserProfileFromDB(value);
            this.fieldCtrl.setValue(temp);
      });
      }
      else {
        let temp = await this.getUserProfileFromDB(value);
        console.log(temp)
        this.fieldCtrl.setValue(temp);
      }



    }
    else this.fieldCtrl.setValue("");
  }

  async getUserSuggestionsFromDB(text: any) {
    let suggestions: any = await this.activitiesPlanningReportService.getUserSuggestionsFromDB(text);
    this.activitiesPlanningReportService.userSuggestions = suggestions.value;
    return suggestions.value;
  }

  async getUserProfileFromDB(oid: any) {
    let userProfile: any = await this.activitiesPlanningReportService.getUserProfileFromDB(oid);
    console.log(userProfile);
    if (userProfile && userProfile.length > 0) {
      return userProfile[0];
    }
    else {
      return "";
    }
  }
}
