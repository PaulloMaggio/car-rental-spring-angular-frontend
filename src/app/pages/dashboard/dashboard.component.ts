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
  selectedRental: any = null;

  motorOptions = [
    { value: 'MOTOR_1_0', label: '1.0' },
    { value: 'MOTOR_1_4', label: '1.4' },
    { value: 'MOTOR_1_6', label: '1.6' },
    { value: 'MOTOR_2_0', label: '2.0' },
    { value: 'MOTOR_TURBO', label: 'Turbo' },
    { value: 'ELECTRIC', label: 'Elétrico' }
  ];

  constructor(
    private carService: CarService,
    private rentalService: RentalService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const role = this.getUserRole();
    if (role !== 'MANAGER') {
      this.activeTab = 'rentals';
    }
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
        next: (res) => {
          this.rentals = res;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err)
      });
    } else if (userId) {
      this.rentalService.findByClient(userId).subscribe({
        next: (res) => {
          this.rentals = res;
          this.cdr.detectChanges();
        },
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
        next: () => this.handleSuccess('Veículo updated!'),
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

  prepareEditRental(rental: any) {
    this.selectedRental = { 
      ...rental,
      startDate: rental.startDate.split('T')[0],
      endDate: rental.endDate.split('T')[0]
    };
    this.cdr.detectChanges();
  }

  saveRentalUpdate() {
    if (!this.selectedRental) return;

    const payload = {
      startDate: new Date(this.selectedRental.startDate + 'T12:00:00Z').toISOString(),
      endDate: new Date(this.selectedRental.endDate + 'T12:00:00Z').toISOString(),
      carId: this.selectedRental.car.id,
      clientId: this.selectedRental.client.id
    };

    this.rentalService.update(this.selectedRental.id, payload).subscribe({
      next: () => {
        alert('Reserva atualizada com sucesso!');
        this.loadRentals();
        this.selectedRental = null;
      },
      error: (err) => {
        console.error(err);
        alert(err.error?.message || 'Erro ao atualizar reserva.');
      }
    });
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
    this.router.navigate(['/home']);
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
    this.cdr.detectChanges();
  }

  getUserRole(): string | null {
    return this.authService.getUserRole();
  }
}