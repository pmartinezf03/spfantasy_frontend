import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComparadorJugadoresComponent } from './comparador-jugadores.component';

describe('ComparadorJugadoresComponent', () => {
  let component: ComparadorJugadoresComponent;
  let fixture: ComponentFixture<ComparadorJugadoresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComparadorJugadoresComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComparadorJugadoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
