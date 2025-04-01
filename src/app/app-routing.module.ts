import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MercadoComponent } from './mercado/mercado.component';
import { EstadisticasLigaComponent } from './estadisticas-liga/estadisticas-liga.component';
import { NoticiasComponent } from './noticias/noticias.component';
import { ChatComponent } from './chat/chat.component';
import { MiPlantillaComponent } from './mi-plantilla/mi-plantilla.component';
import { PerfilComponent } from './perfil/perfil.component'
// Importa los nuevos componentes de autenticación
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { OfertasComponent } from './ofertas/ofertas.component';
import { LigasComponent } from './ligas/ligas.component';
import { LigasGuard } from './guards/ligas.guard';

const routes: Routes = [
  {path: 'mercado', component: MercadoComponent, canActivate: [LigasGuard]},
  { path: 'estadisticas-liga', component: EstadisticasLigaComponent },
  { path: 'plantilla', component: MiPlantillaComponent,   canActivate: [LigasGuard]},
  { path: 'noticias', component: NoticiasComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'ofertas', component: OfertasComponent, canActivate: [LigasGuard] },
  { path: 'perfil', component: PerfilComponent },
  { path: 'ligas', component: LigasComponent },
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' } // Redirección por defecto a login
    ]
  },
  { path: '', redirectTo: '/mercado', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' } // Redirige a login si la ruta no existe
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
