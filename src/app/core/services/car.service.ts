import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Car } from '../models/car.model';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private readonly API = 'http://localhost:8080/api/v1/cars';

  constructor(private http: HttpClient) { }

  findAll(): Observable<Car[]> {
    return this.http.get<Car[]>(this.API);
  }
}