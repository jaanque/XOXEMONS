import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Necessari pels filtres
import { XuxemonService } from '../../services/xuxemon.service';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-xuxedex',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // Importem el FormsModule
  templateUrl: './xuxedex.html',
  styleUrl: './xuxedex.css'
})
export class Xuxedex implements OnInit {
  private xuxemonService = inject(XuxemonService);
  private inventoryService = inject(InventoryService);
  
  // Dades originals des de la BBDD
  xuxemons: any[] = [];
  
  // Dades filtrades per mostrar a l'HTML
  filteredXuxemons: any[] = [];
  
  // Guardem els objectes de l'inventari que són 'xuxe' per mostrar al modal
  inventoryXuxes: any[] = [];

  // Variables per als filtres
  filterType: string = '';
  filterSize: string = '';

  // --- VARIABLES PEL MODAL D'ALIMENTACIÓ ---
  selectedXuxemon: any = null;
  selectedXuxeId: number | null = null;
  isModalOpen: boolean = false;
  evolutionPreview: boolean = false; // Per mostrar l'animació al frontend
  // -----------------------------------------

  ngOnInit() {
    // 1. Demanem les dades al backend
    this.xuxemonService.loadXuxedex().subscribe();
    this.inventoryService.loadInventory().subscribe();

    // 2. Ens subscrivim al BehaviorSubject dels Xuxemons
    this.xuxemonService.xuxedex$.subscribe(data => {
      this.xuxemons = data;
      this.applyFilters(); // Apliquem els filtres inicials (mostra tot)
    });

    // 3. Ens subscrivim a l'Inventari i separem xuxes i vacunes
    this.inventoryService.inventory$.subscribe(items => {
      this.inventoryXuxes = items.filter(item => item.type === 'xuxe' && item.pivot.quantity > 0);
      this.inventoryVaccines = items.filter(item => item.type === 'vacuna' && item.pivot.quantity > 0); // <-- NOU
    });
  }

  // Funció que s'executa cada vegada que l'usuari toca els select de filtres
  applyFilters() {
    this.filteredXuxemons = this.xuxemons.filter(xuxe => {
      // Comprovem si coincideix el tipus (o si no hi ha cap filtre seleccionat)
      const matchType = this.filterType ? xuxe.type === this.filterType : true;
      // Comprovem si coincideix la mida (o si no hi ha cap filtre seleccionat)
      const matchSize = this.filterSize ? xuxe.size === this.filterSize : true;
      
      return matchType && matchSize;
    });
  }
  
  // --- FUNCIONS DEL MODAL ---
  openFeedModal(xuxemon: any) {
    this.selectedXuxemon = xuxemon;
    this.selectedXuxeId = null;
    this.evolutionPreview = false;
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedXuxemon = null;
  }

  // Càlcul de la preview d'evolució (Nivell 3)
  // Càlcul de la preview d'evolució (Nivell 3)
  getXuxesToEvolve(): number {
    if (!this.selectedXuxemon) return 0;
    
    const food = this.selectedXuxemon.pivot.food_eaten || 0;
    let required = 0;
    
    if (this.selectedXuxemon.size === 'Petit') required = 3;
    if (this.selectedXuxemon.size === 'Mitja') required = 5;

    // Si té "Bajón de azúcar", requereix +2 xuxes 
    if (this.selectedXuxemon.pivot.disease === 'Bajón de azúcar') {
      required += 2;
    }

    if (required === 0) return 0; // Els grans ja no evolucionen
    return Math.max(0, required - food);
  }

  feed() {
    if (!this.selectedXuxemon || !this.selectedXuxeId) return;

    this.xuxemonService.feedXuxemon(this.selectedXuxemon.pivot.id, this.selectedXuxeId).subscribe({
      next: (response) => {
        // Si el backend ens diu que ha evolucionat, activem l'animació
        if (response.evolved) {
          this.evolutionPreview = true;
          setTimeout(() => {
            this.closeModal();
            alert('🎉 ' + response.message);
          }, 1500); // Tanquem el modal després de l'animació
        } else {
          this.closeModal();
          // Si no ha evolucionat, comprovem si ha agafat una malaltia al menjar
          if (response.disease) {
            alert('🦠 Oh no! El teu Xuxemon ha contret una malaltia: ' + response.disease);
          }
        }
        // Actualitzem l'inventari i la xuxedex per veure els canvis visuals
        this.inventoryService.loadInventory().subscribe();
      },
      error: (err) => {
        alert('Error: ' + err.error.message);
      }
    });
  }

  // --- VARIABLES I FUNCIONS DEL MODAL DE VACUNES ---
  inventoryVaccines: any[] = [];
  isVaccinateModalOpen: boolean = false;
  selectedVaccineId: number | null = null;

  openVaccinateModal(xuxemon: any) {
    this.selectedXuxemon = xuxemon;
    this.selectedVaccineId = null;
    this.isVaccinateModalOpen = true;
  }

  closeVaccinateModal() {
    this.isVaccinateModalOpen = false;
    this.selectedXuxemon = null;
  }

  vaccinate() {
    if (!this.selectedXuxemon || !this.selectedVaccineId) return;

    this.xuxemonService.vaccinateXuxemon(this.selectedXuxemon.pivot.id, this.selectedVaccineId).subscribe({
      next: (response) => {
        alert('✨ ' + response.message);
        this.closeVaccinateModal();
        this.inventoryService.loadInventory().subscribe(); // Actualitzem la motxilla
      },
      error: (err) => {
        alert('Error: ' + err.error.message);
      }
    });
  }
}