import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TrainerStore } from '../../state/trainer.store';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [],
  template: `
    <div class="space-y-4 animate-slide-up">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-poke-blue to-poke-yellow bg-clip-text text-transparent">
          Trainer Stats
        </h2>
        <p class="text-gray-300/90 mt-1">
          Your trainer profile and battle statistics.
        </p>
      </div>

      <section class="glass-panel p-4 sm:p-6 overflow-hidden">
        @if (profile(); as p) {
          <div class="flex flex-col md:flex-row gap-8 items-start">
            <div class="flex-shrink-0 flex flex-col items-center w-full md:w-auto">
              <div class="w-32 h-32 rounded-full border-4 border-poke-yellow bg-white/5 overflow-hidden p-1 shadow-lg shadow-poke-yellow/20 relative group">
                <img [src]="p.avatarUrl" alt="Avatar" class="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-105">
                <div class="absolute inset-0 rounded-full bg-gradient-to-tr from-poke-blue/40 to-transparent pointer-events-none mix-blend-overlay"></div>
              </div>
              <h3 class="mt-4 text-2xl font-bold text-white">{{ p.name }}</h3>
              <p class="text-poke-yellow font-medium text-sm tracking-wide uppercase mt-1">Pokémon Trainer</p>
            </div>
            
            <div class="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="glass-panel p-5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                <h4 class="text-gray-400 text-sm font-medium mb-1 flex items-center">
                  <svg class="w-4 h-4 mr-1.5 opacity-70" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                  Team Size
                </h4>
                <p class="text-3xl font-bold text-white mt-2">{{ p.team.length }} <span class="text-gray-500 text-xl font-normal">/ 6</span></p>
              </div>
              <div class="glass-panel p-5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                <h4 class="text-gray-400 text-sm font-medium mb-1 flex items-center">
                  <svg class="w-4 h-4 mr-1.5 opacity-70 text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                  Battles Won
                </h4>
                <p class="text-3xl font-bold text-emerald-400 mt-2">{{ p.battlesWon }}</p>
              </div>
              <div class="glass-panel p-5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                <h4 class="text-gray-400 text-sm font-medium mb-1 flex items-center">
                  <svg class="w-4 h-4 mr-1.5 opacity-70 text-rose-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>
                  Battles Lost
                </h4>
                <p class="text-3xl font-bold text-rose-400 mt-2">{{ p.battlesLost }}</p>
              </div>
              <div class="glass-panel p-5 rounded-xl border border-white/5 hover:bg-white/5 transition-colors">
                <h4 class="text-gray-400 text-sm font-medium mb-1 flex items-center">
                  <svg class="w-4 h-4 mr-1.5 opacity-70 text-poke-blue" fill="currentColor" viewBox="0 0 20 20"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path></svg>
                  Win Rate
                </h4>
                <p class="text-3xl font-bold text-poke-blue mt-2">
                  {{ p.battlesWon + p.battlesLost > 0 ? (p.battlesWon / (p.battlesWon + p.battlesLost) * 100).toFixed(1) : 0 }}<span class="text-xl">%</span>
                </p>
              </div>
            </div>
          </div>
        }
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrainerStatsComponent {
  private trainerStore = inject(TrainerStore);
  
  // Expose profile signal to template
  public profile = this.trainerStore.profile;
}
