
import { Component, EventEmitter, forwardRef, HostListener, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { MatMenuTrigger } from '@angular/material/menu';

import { DxHtmlEditorComponent } from 'devextreme-angular';

@Component({
  selector: 'wyswig-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true
    }
  ]
})
export class EditorComponent implements ControlValueAccessor,OnInit {

  @ViewChildren(MatMenuTrigger) triggers!: QueryList<any>;
  @Input() value: any;
  @Input() required: boolean = false;
  @Input() placeholder: any = "<p style='color:#cf000190'> Double to to add title...</p>"
  @ViewChild('editor', { static: true }) editor!: DxHtmlEditorComponent;
  @Output() valueChange = new EventEmitter();

  isBold: boolean = false;
  isItalic: boolean = false;
  isUnderlined: boolean = false;
  isBulletList: boolean = false;
  isNumberedList: boolean = false;

  constructor() { }
  ngOnInit(): void {
    this.editorValue.patchValue(this.value)
  }

  public editorValue: FormControl = new FormControl();

  getFormatValue(format: string) {
    let formats = this.editor.instance.getFormat()
    if (formats[format] != null) {
      return !formats[format]
    }
    else {
      return true
    }
  }
  // editor toolbar functions
  toggleBold() {
    this.editor.instance.format('bold', this.getFormatValue('bold'));
  }

  toggleItalic() {
    this.editor.instance.format('italic', this.getFormatValue('italic'));
  }

  toggleUnderline() {

    this.editor.instance.format('underline', this.getFormatValue('underline'));
  }

  toggleBulletList() {
    let format = this.editor.instance.getFormat()
    format['list'] == 'bullet' ? this.editor.instance.format('list', false) : this.editor.instance.format('list', 'bullet')
  }

  toggleNumberList() {
    let format = this.editor.instance.getFormat()
    format['list'] == 'ordered' ? this.editor.instance.format('list', false) : this.editor.instance.format('list', 'ordered')
  }

  alignLeft() {
    this.editor.instance.format('align', 'left');
  }

  alignCenter() {
    this.editor.instance.format('align', 'center');
  }

  alignRight() {
    this.editor.instance.format('align', 'right');
  }

  setTextColor(e: any) {
    this.editor.instance.format('color', e);
  }

  setFillColor(e: any) {
    this.editor.instance.format('background', e);
  }

  focused() {
    this.triggers.forEach((i) => {
      i.closeMenu()
    })
  }

  isNoteEmpty(value: string) {
    let text = this.editor.instance.getText(0, this.editor.instance.getLength());
    if (text.trim() != '' || value.search(/<img [a-zA-Z\:\/;0-9\,\+\="\ \-\%]*>/) > -1) {
      return false
    }
    return true
  }

  public changed(value: any){}
  public touched(){}

  changeEvent(e: any) {
    let text = this.editor.instance.getText(0, this.editor.instance.getLength());
    if (!this.isNoteEmpty(e))
      this.editorValue.setValue(e);
    else
      this.editorValue.setValue('');

    this.changed(this.editorValue.value)
    this.valueChange.emit();
  }


  setDisabledState(isDisabled: boolean) {
    if (isDisabled) this.editorValue.disable();
    else this.editorValue.enable();
  }

  writeValue(e: any) {
    this.value = e
    this.editorValue.patchValue(e)
  }

  registerOnChange(fn: any): void {
    this.changed = fn
  }
  registerOnTouched(fn: any): void {
    this.touched = fn
  }

}
