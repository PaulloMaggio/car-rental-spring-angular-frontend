import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarService } from '../../core/services/car.service';
import { RentalService } from '../../core/services/rental.service';
import { AuthService } from '../../core/services/auth';
import { Car } from '../../core/models/car.model';

declare var bootstrap: any;

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, FormsModule, RouterModule],
  templateUrl: './fleet.component.html',
  styleUrls: ['./fleet.component.css']
})
export class FleetComponent implements OnInit {
  cars: Car[] = [];
  selectedCar: Car | null = null;
  rentalForm = { startDate: '', endDate: '' };
  isMenuOpen = false;

  constructor(
    private carService: CarService, 
    private rentalService: RentalService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCars();
  }

  loadCars() {
    this.carService.findAll().subscribe({
      next: (res) => this.cars = res,
      error: (err) => console.error(err)
    });
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  getTomorrowDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
    this.router.navigate(['/home']);
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
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
      this.router.navigate(['/login']);
      return;
    }

    if (!this.rentalForm.startDate || !this.rentalForm.endDate || !this.selectedCar?.id) {
      alert("Selecione as datas corretamente.");
      return;
    }

    const payload = {
      startDate: new Date(this.rentalForm.startDate + 'T12:00:00Z').toISOString(),
      endDate: new Date(this.rentalForm.endDate + 'T12:00:00Z').toISOString(),
      carId: this.selectedCar.id,
      clientId: userId
    };

    this.rentalService.create(payload).subscribe({
      next: () => {
        alert('Reserva confirmada! Verifique seu e-mail.');
        this.closeModal();
        this.loadCars();
      },
      error: (err) => alert(err.error?.message || 'Erro ao processar reserva.')
    });
  }

  closeModal() {
    const modalElement = document.getElementById('rentalModal');
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement);
      if (modal) modal.hide();
    }
    this.selectedCar = null;
    this.rentalForm = { startDate: '', endDate: '' };
  }
}