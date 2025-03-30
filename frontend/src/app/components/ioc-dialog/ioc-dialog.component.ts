import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ioc-dialog',
  templateUrl: './ioc-dialog.component.html',
  styleUrls: ['./ioc-dialog.component.scss']
})
export class IocDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { iocDomain: string }) {}
}
