import { Routes } from '@angular/router'
import { LobbyComponent } from './lobby/lobby.component'

export const routes: Routes = [
  { path: 'game', component: LobbyComponent},
  { path: '**', redirectTo: '/game', pathMatch: 'full' }
]
