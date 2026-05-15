import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CarService } from '../../core/services/car.service';
import { RentalService } from '../../core/services/rental.service';
import { AuthService } from '../../core/services/auth';
import { Car } from '../../core/models/car.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  cars: Car[] = [];
  rentals: any[] = [];
  isRefreshing = false;
  isEditing = false;
  activeTab: string = 'cars';
  carForm: Car = this.getEmptyCar();

  constructor(
    private carService: CarService,
    private rentalService: RentalService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCars();
    this.loadRentals();
  }

  getEmptyCar(): Car {
    return {
      brand: '',
      model: '',
      color: '',
      motor: 'MOTOR_2_0',
      status: 'AVAILABLE',
      pricePerDay: 1,
      imageUrl: ''
    };
  }

  loadCars() {
    this.isRefreshing = true;
    this.carService.findAll().subscribe({
      next: (res) => {
        this.cars = [...res];
        this.isRefreshing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.isRefreshing = false;
      }
    });
  }

  loadRentals() {
    const role = this.authService.getUserRole();
    const userId = this.authService.getUserId();
    
    if (role === 'MANAGER') {
      this.rentalService.findAll().subscribe({
        next: (res) => this.rentals = res,
        error: (err) => console.error(err)
      });
    } else if (userId) {
      this.rentalService.findByClient(userId).subscribe({
        next: (res) => this.rentals = res,
        error: (err) => console.error(err)
      });
    }
  }

  prepareEdit(car: Car) {
    this.isEditing = true;
    this.carForm = { ...car };
  }

  saveCar() {
    if (this.isEditing && this.carForm.id) {
      this.carService.update(this.carForm.id, this.carForm).subscribe({
        next: () => this.handleSuccess('Veículo atualizado!'),
        error: (err) => console.error(err)
      });
    } else {
      this.carService.save(this.carForm).subscribe({
        next: () => this.handleSuccess('Veículo cadastrado!'),
        error: (err) => console.error(err)
      });
    }
  }

  private handleSuccess(msg: string) {
    this.resetForm();
    this.loadCars();
    setTimeout(() => alert(msg), 100);
  }

  deleteCar(id: string | undefined) {
    if (!id || !confirm('Deseja realmente remover este veículo?')) return;
    this.carService.delete(id).subscribe(() => this.loadCars());
  }

  deleteRental(id: string | undefined) {
    if (!id || !confirm('Deseja cancelar esta reserva?')) return;
    this.rentalService.delete(id).subscribe(() => {
      this.loadRentals();
      this.loadCars();
      alert('Reserva cancelada com sucesso!');
    });
  }

  logout() {
    this.authService.logout();
  }

  resetForm() {
    this.isEditing = false;
    this.carForm = this.getEmptyCar();
    this.cdr.detectChanges();
  }

  switchTab(tab: string) {
    this.activeTab = tab;
    if (tab === 'rentals') {
      this.loadRentals();
    }
  }

  getUserRole(): string | null {
    return this.authService.getUserRole();
  }
}