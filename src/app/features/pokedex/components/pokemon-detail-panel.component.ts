import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PokemonStore } from '../../../state/pokemon.store';

/**
 * Slide-in panel to display deep details of a selected Pokémon, including a video player.
 */
@Component({
  selector: 'app-pokemon-detail-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pokemon-detail-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokemonDetailPanelComponent {
  private readonly pokemonStore = inject(PokemonStore);
  private readonly sanitizer = inject(DomSanitizer);

  public readonly selectedPokemonId = this.pokemonStore.selectedPokemonId;
  public readonly details = this.pokemonStore.selectedPokemonDetails;
  public readonly loading = this.pokemonStore.detailsLoading;
  public readonly error = this.pokemonStore.detailsError;

  // Placeholder static map for videos
  private readonly videoMap: Record<number, string> = {
    25: 'https://www.youtube.com/embed/1roy4o4tqQM', // Pikachu placeholder
    6: 'https://www.youtube.com/embed/1roy4o4tqQM',  // Charizard placeholder
  };

  /**
   * Closes the panel by clearing the selected ID in the store.
   */
  public closePanel(): void {
    this.pokemonStore.selectPokemon(null);
  }

  /**
   * Returns a sanitized YouTube URL if mapped, or null if no video is available.
   */
  public getVideoUrl(id: number): SafeResourceUrl | null {
    const url = this.videoMap[id];
    if (url) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
    return null;
  }
}
