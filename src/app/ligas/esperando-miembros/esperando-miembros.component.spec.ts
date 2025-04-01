import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsperandoMiembrosComponent } from './esperando-miembros.component';

describe('EsperandoMiembrosComponent', () => {
  let component: EsperandoMiembrosComponent;
  let fixture: ComponentFixture<EsperandoMiembrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EsperandoMiembrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EsperandoMiembrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
