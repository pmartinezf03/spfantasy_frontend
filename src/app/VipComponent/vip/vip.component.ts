import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-vip',
  templateUrl: './vip.component.html',
  styleUrls: ['./vip.component.css']
})
export class VipComponent {
  constructor(private router: Router, private authService: AuthService) {}

  realizarPago(): void {
    alert('✅ Redirigiendo a pasarela de pago segura...');

    setTimeout(() => {
      const userId = this.authService.getUserId();

      if (!userId) {
        alert('❌ No se pudo obtener el ID del usuario.');
        return;
      }

      console.log('🔁 Haciendo VIP al usuario con ID:', userId);

      this.authService.marcarComoVip(userId).subscribe({
        next: (res) => {
          console.log('✅ Usuario marcado como VIP:', res);
          alert('🎉 ¡Ya eres VIP!');

          this.authService.refreshUsuarioCompleto().subscribe((usuarioActualizado) => {
            if (usuarioActualizado) {
              console.log("🧪 VIP hasta:", this.authService.getUser()?.vipHasta); // 👈 AÑADE AQUÍ

              this.router.navigate(['/scouting']);
            } else {
              alert('❌ No se pudo actualizar el estado VIP del usuario.');
            }
          });

        },
        error: (err) => {
          console.error('❌ Error al hacer VIP:', err);
          alert('❌ No se pudo completar la operación VIP');
        }
      });
    }, 1500);
  }
}
