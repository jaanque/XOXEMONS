import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { FriendService } from '../../services/friend.service';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './friends.html',
  styleUrl: './friends.css'
})
export class Friends implements OnInit {
  private friendService = inject(FriendService);

  // Variables per l'estat
  pendingRequests: any[] = [];
  friendsList: any[] = [];
  
  // Cercador reactiu
  searchControl = new FormControl('');
  searchResults: any[] = [];

  ngOnInit() {
    // 1. Carreguem les dades inicials
    this.friendService.loadFriends().subscribe();
    this.friendService.loadPendingRequests().subscribe();

    // 2. Ens subscrivim als canvis per pintar-los a l'HTML
    this.friendService.requests$.subscribe(reqs => this.pendingRequests = reqs);
    this.friendService.friends$.subscribe(friends => this.friendsList = friends);

    // 3. Lògica del cercador reactiu (Nivell 4 - Debounce i min 3 chars)
    this.searchControl.valueChanges.pipe(
      debounceTime(300), // Espera 300ms després de l'última pulsació
      distinctUntilChanged(), // Només busca si el valor ha canviat
      filter(value => {
        if (value && value.length >= 3) {
          return true; // Si té 3 o més caràcters, continua
        } else {
          this.searchResults = []; // Si en té menys, buidem els resultats
          return false;
        }
      }),
      switchMap(value => this.friendService.searchUsers(value!)) // Cancela crides anteriors si n'hi ha de noves
    ).subscribe({
      next: (results) => this.searchResults = results,
      error: (err) => console.error('Error a la cerca', err)
    });
  }

  // Enviar sol·licitud
  sendRequest(userId: number) {
    this.friendService.sendRequest(userId).subscribe({
      next: (res) => {
        alert('✅ ' + res.message);
        this.searchControl.setValue(''); // Netegem el cercador
      },
      error: (err) => alert('❌ Error: ' + err.error.message)
    });
  }

  // Acceptar o Rebutjar
  acceptRequest(id: number) {
    this.friendService.acceptRequest(id).subscribe({
      next: (res) => alert('🎉 ' + res.message),
      error: (err) => alert('Error: ' + err.error.message)
    });
  }

  rejectRequest(id: number) {
    if(confirm('Segur que vols rebutjar aquesta sol·licitud?')) {
      this.friendService.rejectRequest(id).subscribe({
        next: (res) => alert('🗑️ ' + res.message),
        error: (err) => alert('Error: ' + err.error.message)
      });
    }
  }
  
  // Eliminar amic
  removeFriend(id: number) {
    if(confirm('Segur que vols eliminar aquest amic? La decisió és irreversible!')) {
      this.friendService.removeFriend(id).subscribe({
        next: (res) => alert('🗑️ ' + res.message),
        error: (err) => alert('Error: ' + err.error.message)
      });
    }
  }

}