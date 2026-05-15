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

  goToDashboard() {
    this.router.navigate(['/dashboard']);
    this.closeMenu();
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
    
    if (!this.rentalForm.startDate || !this.rentalForm.endDate || !this.selectedCar?.id) {
      alert("Preencha todos os dados.");
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
        alert('Reserva confirmada!');
        this.closeModal();
        this.loadCars();
      },
      error: (err) => {
        alert(err.error?.message || 'Erro ao processar reserva.');
      }
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