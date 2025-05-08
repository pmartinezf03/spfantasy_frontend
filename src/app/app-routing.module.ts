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
import { InicioComponent } from './inicio/inicio.component';
import { RedirigirSiLogueadoGuard } from './guards/redirigir-si-logueado.guard';
import { AuthGuard } from './guards/auth.guard';
import { NoLigaGuard } from './guards/noliga.guard';
import { ComparadorJugadoresComponent } from './comparador/comparador-jugadores/comparador-jugadores.component';
import { ScoutingComponent } from './scouting/scouting.component'; // 👈 Asegúrate de que esto es correcto
import { VipGuard } from './guards/vip.guard';
import { VipComponent } from './VipComponent/vip/vip.component';

const routes: Routes = [
  { path: 'mercado', component: MercadoComponent, canActivate: [LigasGuard, AuthGuard] },
  { path: 'estadisticas-liga', component: EstadisticasLigaComponent, canActivate: [AuthGuard] },
  { path: 'plantilla', component: MiPlantillaComponent, canActivate: [LigasGuard, AuthGuard] },
  { path: 'noticias', component: NoticiasComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard, LigasGuard] },
  { path: 'ofertas', component: OfertasComponent, canActivate: [LigasGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
  { path: 'ligas', component: LigasComponent, canActivate: [AuthGuard] },
  { path: 'comparador', component: ComparadorJugadoresComponent, canActivate: [AuthGuard] },
  { path: 'scouting', component: ScoutingComponent, canActivate: [AuthGuard, LigasGuard] },
  { path: 'vip', component: VipComponent},



  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent,
        canActivate: [RedirigirSiLogueadoGuard]  // ✅ aquí
      },

      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [RedirigirSiLogueadoGuard]  // ✅ aquí también
      }, { path: '', redirectTo: 'login', pathMatch: 'full' }
      // Redirección por defecto a login
    ]
  },
  { path: '', component: InicioComponent, canActivate: [LigasGuard] },
  { path: '**', redirectTo: 'auth/login' } // Redirige a login si la ruta no existe
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
