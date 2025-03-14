import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss']
})
export class ColorPaletteComponent implements OnInit {
 
  @Output() change =  new EventEmitter();
  @Input() initialColor : any;
  @Input() showCurrentColor:boolean=false;
  currentColor : any

  palatte=[
    {color:'#000000',class:'current-color-check-dark'},
    {color:'#FFFFFF',class:'current-color-check-light'},
    {color:'#F6412A',class:'current-color-check-dark'},
    {color:'#ED1361',class:'current-color-check-dark'},
    {color:'#FE5507',class:'current-color-check-dark'},
    {color:'#3D4EB8',class:'current-color-check-dark'},
    {color:'#1193F5',class:'current-color-check-dark'},
    {color:'#88C440',class:'current-color-check-dark'},
    {color:'#CDDD1C',class:'current-color-check-dark'},
    {color:'#FFEC16',class:'current-color-check-dark'},

  ]
  constructor() { }

  ngOnInit(): void {
    this.currentColor=this.initialColor?this.initialColor:'#000000'
  }

  setCurrentColor(color: any){
    this.currentColor=color;
    this.change.emit(this.currentColor);
  }

}
