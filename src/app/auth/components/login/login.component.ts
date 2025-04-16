import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  mensaje: string = '';
  errorMessage: string = '';
  recaptchaResponse: string = '';
  loading: boolean = false;
  showModal: boolean = false;

  // 👉 Esta variable permite activar o desactivar el captcha
  activarCaptcha: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      recaptcha: [
        '',
        this.activarCaptcha ? Validators.required : [] // ✅ Solo es obligatorio si está activo
      ],
    });
  }

  // ✅ Método que recibe la respuesta del reCAPTCHA
  resolved(captchaResponse: string | null): void {
    if (!this.activarCaptcha) return; // ✅ Ignora si está desactivado
    this.recaptchaResponse = captchaResponse || '';
    this.loginForm.controls['recaptcha'].setValue(this.recaptchaResponse);
  }

  iniciarSesion() {
    if (this.loginForm.invalid) {
      this.mensaje = 'Completa todos los campos';
      return;
    }
  
    this.showModal = true;  // Muestra el modal con el spinner
    this.loading = true;    // Muestra el spinner
  
    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Inicio de sesión exitoso:', response);
        this.loading = false;
        this.showModal = false;
        this.mensaje = 'Inicio de sesión exitoso!';
  
        // 🔄 Forzar carga del usuario completo con dinero y dineroPendiente
        this.authService.refreshUsuarioCompleto();
  
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/plantilla']);
        });
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        this.loading = false;
        this.showModal = false;
        this.errorMessage = '⚠ Credenciales incorrectas. Intenta de nuevo.';
        this.mensaje = 'Credenciales incorrectas';
      },
    });
  }
  
}
