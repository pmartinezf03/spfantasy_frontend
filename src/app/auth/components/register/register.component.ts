import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  mensaje: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(4)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$') // Al menos 1 mayúscula, 1 minúscula y 1 número
        ]
      ]
    });
  }

  registrarUsuario() {
    if (this.registerForm.invalid) {
      this.mensaje = 'Por favor, revisa los campos';
      return;
    }

    this.authService.register(this.registerForm.value).subscribe({
      next: response => {
        console.log('Usuario registrado con éxito:', response);
        this.mensaje = 'Registro exitoso!';
      },
      error: error => {
        console.error('Error al registrar usuario:', error);
        this.mensaje = 'Error en el registro.';
      }
    });
  }
}
