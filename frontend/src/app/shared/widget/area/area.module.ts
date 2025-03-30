import { NgModule,ViewChild,Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepicker } from '@angular/material/datepicker';

import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
  declarations: [],
  imports: [
    CommonModule, FormsModule,MatDatepickerModule,MatFormFieldModule,HighchartsChartModule
  ]
})
export class AreaModule { 

  @Input() options: any;
  @ViewChild('picker') picker!: MatDatepicker<any>;

}
