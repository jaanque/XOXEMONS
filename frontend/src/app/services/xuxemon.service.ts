// Pregunte al Backend les xuxedex que te

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class XuxemonService {
  private apiUrl = 'http://localhost:8000/api';
  private http = inject(HttpClient);

  private xuxedexSubject = new BehaviorSubject<any[]>([]);
  public xuxedex$ = this.xuxedexSubject.asObservable();

  loadXuxedex(): Observable<any> {

    return this.http.get<any[]>(`${this.apiUrl}/xuxedex`).pipe(
      tap(xuxemons => this.xuxedexSubject.next(xuxemons))
    );
  }

  feedXuxemon(pivotId: number, itemId: number): Observable<any> {
    // Fem un POST a la ruta que vam crear al Laravel
    return this.http.post<any>(`${this.apiUrl}/xuxemons/${pivotId}/feed`, { item_id: itemId }).pipe(
      tap(() => {
        // Recarreguem la xuxedex i l'inventari després de menjar per veure els canvis
        this.loadXuxedex().subscribe();
      })
    );
  }
}