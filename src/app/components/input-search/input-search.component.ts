import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  Input,
  Output,
  EventEmitter,
  forwardRef,
  Renderer2
} from "@angular/core";
import {
  FormControl,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor
} from "@angular/forms";
import { ReplaySubject, Subject } from "rxjs";
import { BaseControlValueAccessor } from "../../interceptor/ControlValueAccessor";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-input-search",
  templateUrl: "./input-search.component.html",
  styleUrls: ["./input-search.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSearchComponent),
      multi: true
    }
  ]
})
export class InputSearchComponent extends BaseControlValueAccessor<any>
  implements ControlValueAccessor, OnInit, AfterViewInit, OnDestroy {
  public fieldCtrl: FormControl = new FormControl();
  public fieldFilterCtrl: FormControl = new FormControl();
  @Input() list: any = [];
  @Input() placeholder: any;
  @Input() required: boolean = false;
  @Input() disableNone: boolean = false;
  @Output() valueChange = new EventEmitter();
  @Input() override disabled: any = false;
  @Input() hasNoneOption: boolean = true
  // public filteredList = new ReplaySubject();
  public filteredList: ReplaySubject<{ id: string; _id: string; name: string }[]> = new ReplaySubject();
  @Output() change = new EventEmitter();
  @Input() hideMatLabel: boolean = false;



  protected _onDestroy = new Subject<void>();

  constructor(private renderer: Renderer2) {
    super();
  }

  ngOnInit() {
    this.fieldFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBanks();
      });

    this.fieldCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(val => {
        this.value = val;
        this.onChange(val);
        this.valueChange.emit(val);
      });
  }

  emitChanges = (val: any) => {
    this.change.emit(val)
  }
  ngOnChanges() {
    this.filteredList.next(this.list.slice());
  }
  ngAfterViewInit() { }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  protected filterBanks() {
    if (!this.list) {
      return;
    }
    let search = this.fieldFilterCtrl.value;
    if (!search) {
      this.filteredList.next(this.list.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    this.filteredList.next(
      this.list.filter((l: any) => l.name.toLowerCase().indexOf(search) > -1)
    );
  }

  override setDisabledState(isDisabled: boolean) {
    if (isDisabled) this.fieldCtrl.disable();
    else this.fieldCtrl.enable();
  }

  override writeValue(value: any) {
    this.fieldCtrl.setValue(value);
  }
}
