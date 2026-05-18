import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarService } from '../../core/services/car.service';
import { RentalService } from '../../core/services/rental.service';
import { AuthService } from '../../core/services/auth';
import { Car } from '../../core/models/car.model';

declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  cars: Car[] = [];
  selectedCar: Car | null = null;
  isMenuOpen = false;
  rentalForm = { startDate: '', endDate: '' };

  constructor(
    private carService: CarService,
    private rentalService: RentalService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCars();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  loadCars() {
    this.carService.findAll().subscribe({
      next: (res) => this.cars = res.slice(0, 6),
      error: (err) => console.error(err)
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
    this.router.navigate(['/home']);
  }

  scrollToSection(sectionId: string, event: Event) {
    event.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    this.closeMenu();
  }

  prepareRental(car: Car) {
    if (!this.isLoggedIn()) {
      alert('Por favor, faça login para reservar este veículo.');
      this.router.navigate(['/login']);
      return;
    }
    
    if (car.status !== 'AVAILABLE') {
      alert('Veículo indisponível no momento.');
      return;
    }

    this.selectedCar = car;
    const modalElement = document.getElementById('rentalModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  confirmRental() {
    const userId = this.authService.getUserId();
    if (!userId) {
      alert("Sessão expirada. Faça login novamente.");
      this.router.navigate(['/login']);
      return;
    }

    if (!this.rentalForm.startDate || !this.rentalForm.endDate || !this.selectedCar?.id) {
      alert("Selecione as datas corretamente.");
      return;
    }

    const payload = {
      startDate: new Date(this.rentalForm.startDate + 'T12:00:00').toISOString(),
      endDate: new Date(this.rentalForm.endDate + 'T12:00:00').toISOString(),
      carId: this.selectedCar.id,
      clientId: userId
    };

    this.rentalService.create(payload).subscribe({
      next: (response) => {
        console.log("✅ Reserva criada com sucesso!", response);
        this.closeModal();
        alert('✅ Reserva confirmada com sucesso! Verifique seu e-mail.');
        window.location.reload();
      },
      error: (err) => {
        console.error("❌ Erro completo:", err);
        let mensagem = 'Erro ao processar reserva.';
        if (err.error?.message) mensagem = err.error.message;
        else if (err.error?.error) mensagem = err.error.error;
        else if (err.status === 400) mensagem = 'Dados inválidos.';
        else if (err.status === 401) mensagem = 'Sessão expirada. Faça login novamente.';
        else if (err.status === 403) mensagem = 'Acesso negado.';
        alert(mensagem);
      }
    });
  }

  closeModal() {
    const modalElement = document.getElementById('rentalModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    this.selectedCar = null;
    this.rentalForm = { startDate: '', endDate: '' };
  }
}