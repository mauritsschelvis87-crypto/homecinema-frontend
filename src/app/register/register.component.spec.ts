import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../services/auth.service';

describe('RegisterComponent', () => {
  let fixture: ComponentFixture<RegisterComponent>;
  let component: RegisterComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['register']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
  });

  it('shows a validation message when email or password is missing', () => {
    component.email = '';
    component.password = '';

    component.onSubmit();

    expect(component.errorMessage).toBe('Email en wachtwoord zijn verplicht.');
    expect(authServiceSpy.register).not.toHaveBeenCalled();
  });

  it('navigates to the homepage after a successful registration', () => {
    authServiceSpy.register.and.returnValue(of({}));

    component.onSubmit();

    expect(authServiceSpy.register).toHaveBeenCalledWith('dev@test.local', 'test');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });

  it('shows the friendly conflict message for an existing test account', () => {
    authServiceSpy.register.and.returnValue(throwError(() => ({ status: 409 })));

    component.onSubmit();

    expect(component.errorMessage).toBe('Testaccount bestaat al en is klaar voor gebruik.');
  });
});
