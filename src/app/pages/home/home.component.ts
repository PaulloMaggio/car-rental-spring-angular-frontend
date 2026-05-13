import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarService } from '../../core/services/car.service';
import { Car } from '../../core/models/car.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  cars: Car[] = [];
  isMenuOpen = false;

  constructor(private carService: CarService) {}

  ngOnInit(): void {
    this.carService.findAll().subscribe({
      next: (res) => this.cars = res,
      error: (err) => console.error('Erro ao buscar veículos:', err)
    });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }
}