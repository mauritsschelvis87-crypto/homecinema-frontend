import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('navigates to the splash screen after a successful login', () => {
    authServiceSpy.login.and.returnValue(of({ email: 'dev@test.local', token: 'jwt-token' }));

    component.login();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/splash-screen']);
    expect(component.loading).toBeFalse();
    expect(component.message).toBe('');
  });

  it('shows an invalid credentials message on a 401 error', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ status: 401 })));

    component.login();

    expect(component.message).toBe('Ongeldige inloggegevens.');
    expect(component.loading).toBeFalse();
  });
});
