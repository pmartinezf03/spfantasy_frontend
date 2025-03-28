import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  mensaje: string = '';
  errorMessage: string = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  iniciarSesion() {
    if (this.loginForm.invalid) {
      this.mensaje = 'Completa todos los campos';
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: response => {
        console.log('Inicio de sesión exitoso:', response);

        this.mensaje = 'Inicio de sesión exitoso!';

        // ✅ Navegación forzada para que se recargue completamente el componente de destino
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate(['/plantilla']); // o '/chat'
        });
      },
      error: error => {
        console.error('Error al iniciar sesión:', error);
        this.errorMessage = '⚠ Credenciales incorrectas. Intenta de nuevo.';
        this.mensaje = 'Credenciales incorrectas';
      }
    });
  }
}
