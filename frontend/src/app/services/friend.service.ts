import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FriendService {
  private apiUrl = 'http://localhost:8000/api/friends';
  private http = inject(HttpClient);

  // BehaviorSubjects per mantenir l'estat global
  private friendsSubject = new BehaviorSubject<any[]>([]);
  public friends$ = this.friendsSubject.asObservable();

  private requestsSubject = new BehaviorSubject<any[]>([]);
  public requests$ = this.requestsSubject.asObservable();

  // 1. Cercar usuaris (Nivell 4)
  searchUsers(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?q=${query}`);
  }

  // 2. Enviar sol·licitud
  sendRequest(friendId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/request`, { friend_id: friendId });
  }

  // 3. Carregar sol·licituds pendents pròpies i actualitzar el Subject
  loadPendingRequests(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/requests`).pipe(
      tap(requests => this.requestsSubject.next(requests))
    );
  }

  // 4. Acceptar sol·licitud (i recarregar dades automàticament)
  acceptRequest(id: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/accept/${id}`, {}).pipe(
      tap(() => {
        this.loadPendingRequests().subscribe();
        this.loadFriends().subscribe();
      })
    );
  }

  // 5. Rebutjar sol·licitud
  rejectRequest(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/reject/${id}`).pipe(
      tap(() => this.loadPendingRequests().subscribe())
    );
  }

  // 6. Carregar la llista d'amics confirmats
  loadFriends(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(friends => this.friendsSubject.next(friends))
    );
  }

  // 7. Eliminar amic
  removeFriend(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadFriends().subscribe())
    );
  }
}