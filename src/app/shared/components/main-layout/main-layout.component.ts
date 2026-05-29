import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TrainerStore } from '../../../state/trainer.store';

/**
 * Main application shell containing the sidebar navigation
 * and the router outlet for feature content.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private trainerStore = inject(TrainerStore);

  // Expose signals to the template
  public profile = this.trainerStore.profile;
}
