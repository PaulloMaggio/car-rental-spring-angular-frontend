import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'alugar', component: HomeComponent },
  { path: 'dashboard', component: HomeComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];