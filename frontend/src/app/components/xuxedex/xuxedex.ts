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

    // 3. Ens subscrivim al BehaviorSubject de l'Inventari (LA SOLUCIÓ AL TEU PROBLEMA)
    // Filtrem perquè només ens guardi els items que són tipus 'xuxe' i que en tinguis més de 0.
    this.inventoryService.inventory$.subscribe(items => {
      this.inventoryXuxes = items.filter(item => item.type === 'xuxe' && item.pivot.quantity > 0);
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
  getXuxesToEvolve(): number {
    if (!this.selectedXuxemon) return 0;
    const food = this.selectedXuxemon.pivot.food_eaten || 0;
    if (this.selectedXuxemon.size === 'Petit') return Math.max(0, 3 - food);
    if (this.selectedXuxemon.size === 'Mitja') return Math.max(0, 5 - food);
    return 0; // Els grans ja no evolucionen
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
        }
        // Actualitzem l'inventari en background perquè es restin les xuxes visualment
        this.inventoryService.loadInventory().subscribe();
      },
      error: (err) => {
        alert('Error: ' + err.error.message);
      }
    });
  }
}