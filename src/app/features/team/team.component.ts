import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { TrainerStore } from '../../state/trainer.store';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [TitleCasePipe],
  template: `
    <div class="space-y-4 animate-slide-up">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-poke-blue to-poke-yellow bg-clip-text text-transparent">
          My Team
        </h2>
        <p class="text-gray-300/90 mt-1">
          Your current Pokémon roster.
        </p>
      </div>

      <section class="glass-panel p-4 sm:p-6 overflow-hidden min-h-[300px]">
        @if (team().length === 0) {
          <div class="flex flex-col items-center justify-center py-16 text-gray-300/80">
            <div class="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <span class="text-2xl opacity-50">?</span>
            </div>
            <p class="text-lg font-medium">Your team is currently empty.</p>
            <p class="text-sm mt-1">Go to the Pokédex to add some Pokémon!</p>
          </div>
        } @else {
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (pokemon of team(); track pokemon.id) {
              <div class="glass-panel p-4 rounded-xl flex items-center justify-between border border-white/5 hover:bg-white/10 transition-all group">
                <div class="flex items-center space-x-4">
                  <div class="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                    <img [src]="pokemon.imageUrl" [alt]="pokemon.name" class="w-12 h-12 object-contain transition-transform duration-200 group-hover:scale-110" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-white group-hover:text-poke-yellow transition-colors">{{ pokemon.name | titlecase }}</h3>
                    <div class="flex flex-wrap gap-1 mt-1.5">
                      @for (type of pokemon.types; track type) {
                        <span class="px-2 py-0.5 rounded-md bg-white/10 border border-white/5 text-[10px] text-gray-200 uppercase tracking-wider font-medium">
                          {{ type }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
                
                <button 
                  type="button" 
                  (click)="removeFromTeam(pokemon.id)"
                  class="p-2 rounded-lg text-gray-400 hover:bg-rose-500/20 hover:text-rose-400 transition-all focus:outline-none focus:ring-2 focus:ring-rose-500/50 opacity-0 group-hover:opacity-100"
                  aria-label="Remove from team"
                  title="Remove from team"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamComponent {
  private trainerStore = inject(TrainerStore);
  
  // Expose team signal to template
  public team = this.trainerStore.team;

  public removeFromTeam(id: number): void {
    this.trainerStore.removeFromTeam(id);
  }
}
