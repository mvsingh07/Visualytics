import { HttpClient } from '@angular/common/http';
import { Component ,Inject, OnInit} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
@Component({
  selector: 'app-yara',
  templateUrl: './yara.component.html',
  styleUrls: ['./yara.component.scss']
})
export class YaraComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) { }
  
}
