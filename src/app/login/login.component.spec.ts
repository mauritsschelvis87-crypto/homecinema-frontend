import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    httpClientSpy = jasmine.createSpyObj<HttpClient>('HttpClient', ['post']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('navigates to the splash screen after a successful login', () => {
    httpClientSpy.post.and.returnValue(of({}));

    component.login();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/splash-screen']);
    expect(component.loading).toBeFalse();
    expect(component.message).toBe('');
  });

  it('shows an invalid credentials message on a 401 error', () => {
    httpClientSpy.post.and.returnValue(throwError(() => ({ status: 401 })));

    component.login();

    expect(component.message).toBe('Ongeldige inloggegevens.');
    expect(component.loading).toBeFalse();
  });
});
