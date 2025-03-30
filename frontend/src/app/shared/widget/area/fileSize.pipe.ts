import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'fileSize' })
export class FileSizePipe implements PipeTransform {
  transform(value: number): string {
    if (value < 1024) {
      return value.toFixed(2) + ' B';
    } else if (value < 1024 * 1024) {
      return (value / 1024).toFixed(2) + ' KB';
    } else {
      return (value / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }
}
