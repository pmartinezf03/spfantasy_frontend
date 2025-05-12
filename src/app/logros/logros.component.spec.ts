import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogrosComponent } from './logros.component';
import { beforeEach, describe, it } from 'node:test';

describe('LogrosComponent', () => {
  let component: LogrosComponent;
  let fixture: ComponentFixture<LogrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogrosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
function expect(component: LogrosComponent) {
  throw new Error('Function not implemented.');
}

