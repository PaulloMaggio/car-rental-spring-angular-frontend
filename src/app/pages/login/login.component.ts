import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.email && this.password) {
      this.authService.login({ login: this.email, password: this.password }).subscribe({
        next: (res: any) => {
          this.router.navigate(['/home']);
        },
        error: (err: any) => {
          this.message = "Erro ao realizar login. Verifique suas credenciais.";
        }
      });
    }
  }
}