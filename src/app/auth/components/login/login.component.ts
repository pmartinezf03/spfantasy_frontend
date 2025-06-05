import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../../shared/loader.service';
import { ToastService } from '../../../services/toast.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  mensaje: string = '';
  errorMessage: string = '';
  recaptchaResponse: string = '';
  activarCaptcha: boolean = false;
  toastMessage: string | null = null;

  constructor(
    private fb: FormBuilder,                 // Constructor de formularios
    private authService: AuthService,        // Servicio de autenticación
    private router: Router,                  // Para redirigir tras login
    private loaderService: LoaderService,    // Muestra spinners/barras de carga
    private toastService: ToastService       // Muestra notificaciones tipo toast
  ) {
    // Inicializa el formulario de login con validaciones básicas
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      recaptcha: ['', this.activarCaptcha ? Validators.required : []],
    });
  }

  // Se ejecuta al iniciar el componente
  ngOnInit(): void {

    this.loaderService.showBarraCarga(); // Muestra la barra de carga inicial
    setTimeout(() => {
      this.loaderService.hideBarraCarga(); // La oculta después de 1,2 s
    }, 1200);
  }

  // Método que se ejecuta al resolver el captcha
  resolved(captchaResponse: string | null): void {
    if (!this.activarCaptcha) return;
    this.recaptchaResponse = captchaResponse || '';
    this.loginForm.controls['recaptcha'].setValue(this.recaptchaResponse);
  }

  // Función que se ejecuta al pulsar "Iniciar sesión"
  iniciarSesion() {
    if (this.loginForm.invalid) {
      this.mensaje = 'Completa todos los campos';
      return;
    }

    this.loaderService.showSpinner(); // Muestra el spinner

    // Llama al servicio de login
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        // Tras login, actualiza los datos completos del usuario
        this.authService.refreshUsuarioCompleto().subscribe((usuarioCompleto) => {
          this.loaderService.hideSpinner();

          // Verifica si el usuario es VIP (según fecha de expiración)
          const vipHasta = usuarioCompleto?.vipHasta;
          const ahora = new Date();
          const expiracion = vipHasta ? new Date(vipHasta) : null;
          const esVip = expiracion && expiracion > ahora;

          
          

          // Muestra un mensaje si el usuario tiene racha de logins activa
          if (usuarioCompleto?.rachaLogin) {
            

            if (usuarioCompleto.rachaLogin > 1) {
              this.toastService.showToast(`¡Racha de Logins Consecutivos: ${usuarioCompleto.rachaLogin} días!`);
              
            }
          }

          // Redirige al usuario al home tras login exitoso
          this.router.navigate(['/']);
        });
      },
      error: () => {
        // En caso de error en el login
        this.loaderService.hideSpinner();
        this.errorMessage = ' Credenciales incorrectas. Intenta de nuevo.';
        this.mensaje = 'Credenciales incorrectas';
      }
    });
  }
}
