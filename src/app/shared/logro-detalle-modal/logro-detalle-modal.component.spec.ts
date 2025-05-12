import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogroDetalleModalComponent } from './logro-detalle-modal.component';

describe('LogroDetalleModalComponent', () => {
  let component: LogroDetalleModalComponent;
  let fixture: ComponentFixture<LogroDetalleModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogroDetalleModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogroDetalleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
