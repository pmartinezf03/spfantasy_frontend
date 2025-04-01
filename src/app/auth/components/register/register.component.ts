import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent {
  registerForm: FormGroup;
  captchaToken: string | null = null;
  captchaInvalido: boolean = false;
  mensaje: string = '';
  recaptchaSiteKey: string = '6LeXEgUrAAAAAE1MO62uBhHxZYfa4uWPQhsLyCLY';
  loading: boolean = false;  // Gestionar el estado del spinner
  showModal: boolean = false; // Mostrar el modal con el spinner

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$')
        ]
      ]
    });
  }

  onCaptchaResolved(token: string) {
    this.captchaToken = token;
    this.captchaInvalido = false;
  }

  registrarUsuario() {
    if (this.registerForm.invalid) {
      this.mensaje = 'Por favor, revisa los campos';
      return;
    }

    if (!this.captchaToken) {
      this.captchaInvalido = true;
      this.mensaje = 'Por favor, verifica que no eres un robot.';
      return;
    }

    // Activar el spinner
    this.loading = true;
    this.showModal = true;

    const datos = {
      ...this.registerForm.value,
      recaptcha: this.captchaToken
    };

    this.authService.register(datos).subscribe({
      next: response => {
        console.log('Usuario registrado con éxito:', response);
        this.loading = false;  // Desactivar el spinner
        this.showModal = false;  // Ocultar el modal
        this.mensaje = 'Registro exitoso!';
        this.captchaToken = null;
      },
      error: error => {
        console.error('Error al registrar usuario:', error);
        this.loading = false;  // Desactivar el spinner
        this.showModal = false;  // Ocultar el modal
        this.mensaje = 'Error en el registro.';
      }
    });
  }
}
