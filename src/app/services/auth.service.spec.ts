import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService, UserProfile } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

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
  });

  it('register sends the expected payload', () => {
    service.register('dev@test.local', 'test').subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/api/auth/register');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      email: 'dev@test.local',
      password: 'test',
    });
    expect(request.request.withCredentials).toBeTrue();

    request.flush({});
  });

  it('login stores the user profile and marks the user as logged in', () => {
    const user: UserProfile = { email: 'dev@test.local' };
    let loggedIn: boolean | undefined;
    let profile: UserProfile | null | undefined;

    service.isLoggedIn().subscribe(value => {
      loggedIn = value;
    });

    service.login('dev@test.local', 'test').subscribe();

    const request = httpTestingController.expectOne('http://localhost:8080/api/auth/login');
    expect(request.request.method).toBe('POST');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.headers.get('Authorization')).toBe('Basic ' + btoa('dev@test.local:test'));

    request.flush(user);

    service.getUserProfile().subscribe(value => {
      profile = value;
    });

    expect(loggedIn).toBeTrue();
    expect(profile).toEqual(user);
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
