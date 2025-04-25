import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { LoaderService } from '../../../shared/loader.service';

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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private loaderService: LoaderService
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      recaptcha: [
        '',
        this.activarCaptcha ? Validators.required : []
      ],
    });
  }

  ngOnInit(): void {
    this.loaderService.showBarraCarga();
    setTimeout(() => {
      this.loaderService.hideBarraCarga();
    }, 1200); // Opcional, puedes ajustar
  }

  resolved(captchaResponse: string | null): void {
    if (!this.activarCaptcha) return;
    this.recaptchaResponse = captchaResponse || '';
    this.loginForm.controls['recaptcha'].setValue(this.recaptchaResponse);
  }

  iniciarSesion() {
    if (this.loginForm.invalid) {
      this.mensaje = 'Completa todos los campos';
      return;
    }

    this.loaderService.showSpinner(); // ✅ Usamos el spinner del LoaderService

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.authService.refreshUsuarioCompleto();
        setTimeout(() => {
          this.loaderService.hideSpinner(); // ✅ Ocultamos spinner tras carga
          this.router.navigate(['/']);
        }, 1000); // Puedes ajustar el tiempo para que se vea
      },
      error: () => {
        this.loaderService.hideSpinner();
        this.errorMessage = '⚠ Credenciales incorrectas. Intenta de nuevo.';
        this.mensaje = 'Credenciales incorrectas';
      },
    });
  }
}
