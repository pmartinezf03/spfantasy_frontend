import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarLigaComponent } from './gestionar-liga.component';

describe('GestionarLigaComponent', () => {
  let component: GestionarLigaComponent;
  let fixture: ComponentFixture<GestionarLigaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GestionarLigaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarLigaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
