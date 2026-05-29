import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { TrainerStore } from '../../state/trainer.store';
import { TeamBuilderComponent } from './components/team-builder/team-builder.component';

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [TeamBuilderComponent],
  template: `
    <div class="space-y-8 animate-slide-up">
      <div>
        <h2 class="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-poke-blue to-poke-yellow bg-clip-text text-transparent">
          My Team
        </h2>
        <p class="text-gray-300/90 mt-1">
          Your current Pokémon roster and team builder.
        </p>
      </div>

      <!-- Advanced Team Builder Form -->
      <app-team-builder></app-team-builder>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamComponent {
}
