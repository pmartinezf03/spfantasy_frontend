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
  recaptchaResponse: string = '';  // Asegurándote de que sea solo string

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      recaptcha: ['', Validators.required],  // Validar que reCAPTCHA es obligatorio
    });
  }

  // Método que recibe la respuesta del reCAPTCHA
  resolved(captchaResponse: string | null): void {
    if (captchaResponse) {
      this.recaptchaResponse = captchaResponse;  // Si es un string válido, lo asignamos
    } else {
      this.recaptchaResponse = '';  // Si es null, asignamos una cadena vacía
    }
    this.loginForm.controls['recaptcha'].setValue(this.recaptchaResponse);  // Poner el valor en el formulario
  }

  iniciarSesion() {
    if (this.loginForm.invalid) {
      this.mensaje = 'Completa todos los campos';
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        console.log('Inicio de sesión exitoso:', response);
        this.mensaje = 'Inicio de sesión exitoso!';
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/plantilla']); // o '/chat'
        });
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
        this.errorMessage = '⚠ Credenciales incorrectas. Intenta de nuevo.';
        this.mensaje = 'Credenciales incorrectas';
      },
    });
  }
}
