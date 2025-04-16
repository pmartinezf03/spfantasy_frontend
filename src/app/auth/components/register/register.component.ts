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
  loading: boolean = false;
  showModal: boolean = false;

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

    this.loading = true;
    this.showModal = true;

    const datos = {
      ...this.registerForm.value,
      recaptcha: this.captchaToken
    };

    this.authService.register(datos).subscribe({
      next: response => {
        console.log('✅ Usuario registrado correctamente:', response);
        this.loading = false;
        this.showModal = false;
        this.mensaje = '🎉 Registro exitoso. Ahora puedes iniciar sesión.';

        // 🔁 Limpia cualquier rastro previo por seguridad
        this.authService.logout();
        this.registerForm.reset();
        this.captchaToken = null;
      },
      error: error => {
        console.error('❌ Error al registrar usuario:', error);
        this.loading = false;
        this.showModal = false;
        this.mensaje = '⚠ Error en el registro. Inténtalo nuevamente.';
      }
    });
  }
}
