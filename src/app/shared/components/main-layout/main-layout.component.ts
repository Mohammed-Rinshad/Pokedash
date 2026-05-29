import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TrainerStore } from '../../../state/trainer.store';
import { TrainerSelectors } from '../../../state/trainer.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { ToastContainerComponent } from '../toast-container/toast-container.component';

const FALLBACK_AVATAR_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png';

/**
 * Main application shell containing the sidebar navigation
 * and the router outlet for feature content.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  templateUrl: './main-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayoutComponent {
  private trainerStore = inject(TrainerStore);
  private trainerSelectors = inject(TrainerSelectors);

  // Expose signals to the template
  public profile = this.trainerStore.profile;
  public totalTeams = toSignal(this.trainerSelectors.totalTeams$, { initialValue: 0 });

  public avatarUrl(url: string | null | undefined): string {
    const trimmed = url?.trim();
    return trimmed ? trimmed : FALLBACK_AVATAR_URL;
  }

  public handleAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== FALLBACK_AVATAR_URL) {
      img.src = FALLBACK_AVATAR_URL;
    }
  }
}
