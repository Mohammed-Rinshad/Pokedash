import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/components/main-layout/main-layout.component';
import { PokedexComponent } from './features/pokedex/pokedex.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'pokedex', pathMatch: 'full' },
      { path: 'pokedex', component: PokedexComponent },
      { 
        path: 'team', 
        loadComponent: () => import('./features/team/team.component').then(m => m.TeamComponent) 
      },
      { 
        path: 'stats', 
        loadComponent: () => import('./features/stats/stats.component').then(m => m.TrainerStatsComponent) 
      }
    ]
  }
];
