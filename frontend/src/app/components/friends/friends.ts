import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FriendService } from '../../services/friend.service';

@Component({
  selector: 'app-friends',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './friends.html',
  styleUrl: './friends.css'
})
export class Friends implements OnInit {
  private friendService = inject(FriendService);

  ngOnInit() {
    // Inicialitzem les dades només entrar a la pàgina
    this.friendService.loadFriends().subscribe();
    this.friendService.loadPendingRequests().subscribe();
  }
}