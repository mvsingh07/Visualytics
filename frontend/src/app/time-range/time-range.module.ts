import { NgModule ,ViewChild,Input} from '@angular/core';
import { CommonModule, JsonPipe, NgFor, NgIf } from '@angular/common';
import { MatDatepicker } from '@angular/material/datepicker';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,FormsModule, MatDatepickerModule, MatFormFieldModule,NgFor,NgIf,JsonPipe
  
  ]
})
export class TimeRangeModule {
    @Input() options: any;
    @ViewChild('picker') picker!: MatDatepicker<any>;
  }
