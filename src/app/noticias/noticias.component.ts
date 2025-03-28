import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-noticias',
  templateUrl: './noticias.component.html',
  styleUrls: ['./noticias.component.css']
})
export class NoticiasComponent implements OnInit {
  noticias: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.obtenerNoticias();
  }

  obtenerNoticias(): void {
    const url = `https://newsapi.org/v2/everything?q=baloncesto&language=es&sortBy=publishedAt&pageSize=15&apiKey=68d8835c43cc4323b29494c947a03473`;

    this.http.get<any>(url).subscribe(response => {
      this.noticias = response.articles;
      console.log('✅ Noticias:', this.noticias);
    }, error => {
      console.error('❌ Error al cargar noticias:', error);
    });
  }

  darLike(titulo: string) {
    console.log('👍 Me gusta en:', titulo);
  }
}
