import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // Afegit FormsModule
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth';
import { XuxemonService } from '../../services/xuxemon.service'; // Afegit pel XuxemonService

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule], // Afegit FormsModule aquí
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private xuxemonService = inject(XuxemonService); // Servei de Xuxemons per les configuracions

  // --- VARIABLES SECCIÓ REGALS ---
  users: any[] = [];
  itemForm: FormGroup;
  successMessage: string = '';
  errorMessage: string = '';

  // --- VARIABLES SECCIÓ CONFIGURACIÓ (MALALTIES) ---
  settings = {
    atracon_prob: 15,
    sobredosis_prob: 10,
    bajon_prob: 5
  };
  isSaving = false;

  constructor() {
    // Creem el formulari reactiu per la zona de regals
    this.itemForm = this.fb.group({
      user_id: ['', Validators.required],
      item_type: ['xuxe', Validators.required], // 'xuxe' o 'vacuna'
      item_name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadSettings(); // Carreguem les probabilitats globals a l'iniciar
  }

  // ==========================================
  // 1. LÒGICA DE REGALS (USuaris i Ítems)
  // ==========================================
  
  // Carreguem tots els usuaris de la BBDD
  loadUsers() {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    // Suposem que tens aquesta ruta creada al Laravel
    this.http.get<any[]>('http://localhost:8000/api/admin/users', { headers }).subscribe({
      next: (data) => this.users = data,
      error: (err) => console.error('Error carregant usuaris', err)
    });
  }
  
  giveRandomXuxemon() {
    // Agafem l'usuari que estigui seleccionat al desplegable
    const userId = this.itemForm.get('user_id')?.value;
    
    if (!userId) {
      this.errorMessage = "Selecciona un jugador primer!";
      return;
    }

    this.http.post('http://localhost:8000/api/admin/give-xuxemon', { user_id: userId }).subscribe({
      next: (response: any) => {
        this.successMessage = response.message;
        this.errorMessage = '';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: () => this.errorMessage = 'Error en donar el Xuxemon.'
    });
  }

  // Enviem l'ítem a l'usuari
  onSubmit() {
    if (this.itemForm.valid) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
      
      this.http.post('http://localhost:8000/api/admin/give-item', this.itemForm.value, { headers }).subscribe({
        next: (response: any) => {
          this.successMessage = 'Ítem enviat correctament!';
          this.errorMessage = '';
          this.itemForm.reset({ item_type: 'xuxe', quantity: 1 }); // Reiniciem el form
          
          // Esborrem el missatge d'èxit al cap de 3 segons
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          this.errorMessage = 'Error en enviar l\'ítem.';
          this.successMessage = '';
        }
      });
    }
  }

  // ==========================================
  // 2. LÒGICA DE CONFIGURACIÓ GLOBAL (MALALTIES)
  // ==========================================

  loadSettings() {
    this.xuxemonService.getSettings().subscribe({
      next: (data) => {
        // Si hi ha dades a la BD, sobreescrivim els valors per defecte
        if (data.atracon_prob !== undefined) this.settings.atracon_prob = data.atracon_prob;
        if (data.sobredosis_prob !== undefined) this.settings.sobredosis_prob = data.sobredosis_prob;
        if (data.bajon_prob !== undefined) this.settings.bajon_prob = data.bajon_prob;
      },
      error: (err) => console.error('Error carregant configuració', err)
    });
  }

  saveSettings() {
    // Validació bàsica perquè la suma no passi del 100%
    const total = this.settings.atracon_prob + this.settings.sobredosis_prob + this.settings.bajon_prob;
    if (total > 100) {
      alert('⚠️ Error: La suma de les probabilitats no pot superar el 100%. Actualment suma: ' + total + '%');
      return;
    }

    this.isSaving = true;
    this.xuxemonService.updateSettings(this.settings).subscribe({
      next: (res) => {
        alert(res.message);
        this.isSaving = false;
      },
      error: (err) => {
        alert('Error al guardar: ' + err.error.message);
        this.isSaving = false;
      }
    });
  }
}