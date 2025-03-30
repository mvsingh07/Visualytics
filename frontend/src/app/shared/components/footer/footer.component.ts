import { Component, OnInit } from '@angular/core';
import { ThemeService } from 'src/app/theme.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit{


  constructor(private themeService:ThemeService){}


  isDarkMode: boolean = false;
  private themeSubscription: Subscription = new Subscription();


  ngOnInit(): void {
    
    // this.themeSubscription = this.themeService.isDarkMode$.subscribe((isDarkMode) => {
    //   this.isDarkMode = isDarkMode;
    // });
  }

  ngOnDestroy(): void {
    this.themeSubscription.unsubscribe();
  }

  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    this.updateTheme();
  }

  private updateTheme(): void {
    const header = document.getElementById('header');
    if (header) {
      header.classList.toggle('dark-mode', this.isDarkMode);
    }
  }
}
