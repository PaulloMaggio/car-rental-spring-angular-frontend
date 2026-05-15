import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CarService } from '../../core/services/car.service';
import { RentalService } from '../../core/services/rental.service';
import { Car } from '../../core/models/car.model';

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

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  prepareRental(car: Car) {
    if (!this.isLoggedIn()) {
      alert('Você precisa estar logado para fazer uma reserva.');
      this.router.navigate(['/login']);
      return;
    }
    if (car.status !== 'AVAILABLE') {
      alert('Este veículo não está disponível no momento.');
      return;
    }
    this.selectedCar = car;
  }

  confirmRental() {
    if (!this.selectedCar || !this.rentalForm.startDate || !this.rentalForm.endDate) {
      alert("Preencha todas as datas.");
      return;
    }
    if (new Date(this.rentalForm.startDate) > new Date(this.rentalForm.endDate)) {
      alert("A data de devolução não pode ser anterior à retirada.");
      return;
    }

    const userId = localStorage.getItem('userId');
    const payload = {
      startDate: new Date(this.rentalForm.startDate + 'T09:00:00').toISOString(),
      endDate: new Date(this.rentalForm.endDate + 'T18:00:00').toISOString(),
      carId: this.selectedCar.id,
      clientId: userId
    };

    this.rentalService.create(payload).subscribe({
      next: () => {
        alert('Reserva concluída com sucesso!');
        this.rentalForm = { startDate: '', endDate: '' };
        this.selectedCar = null;
        this.loadCars();
      },
      error: () => alert('Erro ao finalizar reserva.')
    });
  }
}