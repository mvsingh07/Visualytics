import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { AuthService } from './services/auth.service';
// Replace with your authentication service

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    // Check the user's role using the AuthService
    const userRole = this.authService.getUserRole();

    // console.log("Fetched User is ",userRole);
    // Check if the user has the "admin" role
    if (userRole === 'admin') {
      return true; // Allow access if the user is an admin
    } else {
      // Redirect to the login page or another route if the user is not an admin
      this.router.navigate(['/user/dd']);
      return false;
    }
  }
}
