import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  message = '';
  isMenuOpen = false;
  showRegisterModal = false;

  registerData = {
    nome: '',
    login: '',
    password: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  onSubmit(): void {
    if (this.email && this.password) {
      this.authService.login({ login: this.email, password: this.password }).subscribe({
        next: (res: any) => {
          if (res.role === 'MANAGER') {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/alugar']);
          }
        },
        error: (err: any) => {
          this.message = "Erro ao realizar login. Verifique suas credenciais.";
        }
      });
    }
  }

  onRegister(): void {
    if (this.registerData.login && this.registerData.password) {
      this.authService.register(this.registerData).subscribe({
        next: () => {
          this.showRegisterModal = false;
          this.message = "Cadastro realizado com sucesso! Faça login.";
          this.registerData = { nome: '', login: '', password: '' };
        },
        error: (err: any) => {
          console.error(err);
          alert("Erro ao cadastrar usuário.");
        }
      });
    }
  }
}