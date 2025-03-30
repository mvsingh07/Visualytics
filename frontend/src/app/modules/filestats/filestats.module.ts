import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input'; // Import this if not already imported
import { filestatsComponent } from './filestats.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule, // 
  ]
})
export class FilestatsModule { }
