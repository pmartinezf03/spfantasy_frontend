import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

import { MatTableModule } from '@angular/material/table';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { PrimeNGConfig } from 'primeng/api';
import { ReactiveFormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { RecaptchaModule } from "ng-recaptcha";


// Importación de componentes
import { MercadoComponent } from './mercado/mercado.component';
import { EstadisticasLigaComponent } from './estadisticas-liga/estadisticas-liga.component';
import { NoticiasComponent } from './noticias/noticias.component';
import { NavigationComponent } from './navigation/navigation.component';
import { ChatComponent } from './chat/chat.component';
import { NoticiasDetalleComponent } from './noticias/noticias-detalle/noticias-detalle.component';
import { MiPlantillaComponent } from './mi-plantilla/mi-plantilla.component';
import { JugadorCardComponent } from './mi-plantilla/jugador-card/jugador-card.component';
import { AlineacionComponent } from './mi-plantilla/alineacion/alineacion.component';
import { SidebarComponent } from './mi-plantilla/sidebar/sidebar.component';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { GruposComponent } from './chat/grupos/grupos.component';
import { TarjetaInformacionComponent } from './mi-plantilla/tarjeta-informacion/tarjeta-informacion.component';
import { OfertasComponent } from './ofertas/ofertas.component';
import { OfertaDialogoComponent } from './estadisticas-liga/oferta-dialogo/oferta-dialogo.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ContactListComponent } from './chat/contact-list/contact-list.component';
import { ChatWindowComponent } from './chat/chat-window/chat-window.component';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { CurrencyPipe } from '@angular/common';
import { PanelModule } from 'primeng/panel';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { CardModule } from 'primeng/card';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { CarouselModule } from 'primeng/carousel';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { LigasComponent } from './ligas/ligas.component';
import { CrearLigaComponent } from './ligas/crear-liga/crear-liga.component';
import { UnirseLigaComponent } from './ligas/unirse-liga/unirse-liga.component';
import { GestionarLigaComponent } from './ligas/gestionar-liga/gestionar-liga.component';
import { EsperandoMiembrosComponent } from './ligas/esperando-miembros/esperando-miembros.component';
import { FiltroContactosPipe } from './pipes/filtro-contactos.pipe';
import { HistorialComponent } from './ofertas/historial/historial.component';
import { NgChartsModule } from 'ng2-charts';
import { InicioComponent } from './inicio/inicio.component';
import { ChartModule } from 'primeng/chart';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppLoaderComponent } from './shared/app-loader/app-loader.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ComparadorJugadoresComponent } from './comparador/comparador-jugadores/comparador-jugadores.component';
import { DropdownModule } from 'primeng/dropdown';
import { VipComponent } from './VipComponent/vip/vip.component';
import { ScoutingComponent } from './scouting/scouting.component';
import { LogrosComponent } from './logros/logros.component';
import { LogroDetalleModalComponent } from './shared/logro-detalle-modal/logro-detalle-modal.component';
import { JugadorTarjetaComponent } from './mi-plantilla/jugador-tarjeta/jugador-tarjeta.component';



@NgModule({
  declarations: [
    AppComponent,
    MercadoComponent,
    EstadisticasLigaComponent,
    NoticiasComponent,
    NavigationComponent,
    ChatComponent,
    NoticiasDetalleComponent,
    MiPlantillaComponent,
    JugadorCardComponent,
    AlineacionComponent,
    SidebarComponent,
    LoginComponent,
    RegisterComponent,
    GruposComponent,
    TarjetaInformacionComponent,
    OfertasComponent,
    OfertaDialogoComponent,
    PerfilComponent,
    ContactListComponent,
    ChatWindowComponent,
    LigasComponent,
    CrearLigaComponent,
    UnirseLigaComponent,
    GestionarLigaComponent,
    EsperandoMiembrosComponent,
    FiltroContactosPipe,
    HistorialComponent,
    InicioComponent,
    AppLoaderComponent,
    ComparadorJugadoresComponent,
    VipComponent,
    ScoutingComponent,
    LogrosComponent,
    LogroDetalleModalComponent,
    JugadorTarjetaComponent,



  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    DragDropModule,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    ReactiveFormsModule,
    DialogModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    CommonModule,
    MenubarModule,
    CurrencyPipe,
    CardModule,
    PanelModule,
    TagModule,
    DividerModule,
    BadgeModule,
    AvatarModule,
    InputNumberModule,
    ProgressBarModule,
    ToastModule,
    CarouselModule,
    RecaptchaModule,
    ProgressSpinnerModule,
    NgChartsModule,
    ChartModule,
    ChipModule,
    ConfirmDialogModule,
    DropdownModule,
  ],
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    PrimeNGConfig,
    ConfirmationService,
    MessageService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
