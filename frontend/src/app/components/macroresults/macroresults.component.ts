import { HttpClient } from '@angular/common/http';
import { Component ,Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-macroresults',
  templateUrl: './macroresults.component.html',
  styleUrls: ['./macroresults.component.scss']
})
export class MacroresultsComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
  

}
