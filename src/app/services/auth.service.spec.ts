import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthResponse, AuthService, UserProfile } from './auth.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
    localStorage.clear();
  });

  it('register sends the expected payload', () => {
    service.register('dev@test.local', 'test').subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/register`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'dev@test.local',
      password: 'test',
    });
    expect(request.request.withCredentials).toBeTrue();

    request.flush({});
  });

  it('login stores the user profile and marks the user as logged in', () => {
    const user: AuthResponse = {
      email: 'dev@test.local',
      token: 'jwt-token',
      tokenType: 'Bearer',
    };
    let loggedIn: boolean | undefined;
    let profile: UserProfile | null | undefined;

    service.isLoggedIn().subscribe(value => {
      loggedIn = value;
    });

    service.login('dev@test.local', 'test').subscribe();

    const request = httpTestingController.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.body).toEqual({
      email: 'dev@test.local',
      password: 'test',
    });

    request.flush(user);

    service.getUserProfile().subscribe(value => {
      profile = value;
    });

    expect(loggedIn).toBeTrue();
    expect(profile).toEqual({ email: 'dev@test.local' });
    expect(localStorage.getItem('token')).toBe('jwt-token');
    expect(localStorage.getItem('username')).toBe('dev@test.local');
  });

  it('logout clears the user session state', () => {
    service.logout();

    let loggedIn: boolean | undefined;
    let profile: UserProfile | null | undefined;

    service.isLoggedIn().subscribe(value => {
      loggedIn = value;
    });

    service.getUserProfile().subscribe(value => {
      profile = value;
    });

    expect(loggedIn).toBeFalse();
    expect(profile).toBeNull();
  });
});
