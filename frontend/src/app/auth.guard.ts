import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  /*canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    console.log('AuthGuard triggered'); // Add this line to check if AuthGuard is executed

    // Check if the user is logged in
    if (this.authService.isLoggedIn()) {
      // User is logged in, allow access to the route
      console.warn(true);
      return true;
    } else {
      // User is not logged in, navigate to the login page
      console.warn(false);
      return this.router.createUrlTree(['']);
    }
  }*/
  
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    console.log('AuthGuard triggered'); 
    return this.authService.isLoggedIn().pipe(
      map(isLoggedIn => {
        if (isLoggedIn) {
          console.warn("Token is present");
          return true; // User is authenticated, allow access to the route
        } else {
          // User is not authenticated, navigate to the login page
          console.warn("false");
          return this.router.createUrlTree(['/user-login']);
        }
      })
    );
  }
}
