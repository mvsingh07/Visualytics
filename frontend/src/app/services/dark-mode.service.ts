import { Injectable ,Renderer2,RendererFactory2} from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  toggleDarkMode(): void {
    const newValue = !this.darkMode.value;
    this.darkMode.next(newValue);

    // Apply or remove the "dark-mode" class to the body element
    if (newValue) {
      this.renderer.addClass(document.body, 'dark-mode');
      console.log("loadeddddddd", newValue);
    } else {
      this.renderer.removeClass(document.body, 'dark-mode');
      console.log("not loadeddddddd", newValue);
    }
  }

  isDarkMode() {
    return this.darkMode.asObservable();
  }
}
