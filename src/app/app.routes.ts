import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { VerifyComponent } from './pages/verify/verify.component';
import { MainLayoutComponent } from './components/layout/main-layout/main-layout.component';
import { LibraryComponent } from './pages/library/library.component';
import { SearchComponent } from './pages/search/search.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'verify/:code', component: VerifyComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'library', pathMatch: 'full' },
      { path: 'library', component: LibraryComponent },
      { path: 'search', component: SearchComponent },
      {
        path: 'playlist/:platform/:id',
        loadComponent: () =>
          import('./pages/playlist/playlist.component').then((m) => m.PlaylistComponent),
      },
      {
        path: 'artist/:platform/:id',
        loadComponent: () =>
          import('./pages/artist/artist.component').then((m) => m.ArtistComponent),
      },
      {
        path: 'user-playlist/:id',
        loadComponent: () =>
          import('./pages/user-playlist/user-playlist').then((m) => m.UserPlaylist),
      },
    ],
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
