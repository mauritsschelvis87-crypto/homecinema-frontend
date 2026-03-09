import { Routes, CanMatchFn, RedirectCommand, Router } from '@angular/router';
import { inject } from '@angular/core';
import { LoginService } from './services/login.service';
import { RouterModule } from '@angular/router';
import { GiftMovieComponent } from './gift-movie/gift-movie.component';

import { HomepageComponent } from './homepage/homepage.component';
import { WishlistComponent } from './wishlist/wishlist.component';
import { RegisterComponent } from './register/register.component';
import { ShoppingPageComponent } from './shopping-page/shopping-page.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { AboutComponent } from './about/about.component';
import { CollectionComponent } from './collection/collection.component';
import { NewsComponent } from './news/news.component';
import { ExploreComponent } from './explore/explore.component';
import { DirectorDetailComponent } from './director-detail/director-detail.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { CartComponent } from './cart/cart.component';
import { AccountComponent } from './account/account.component';
import { OrderHistoryDetailComponent } from './order-history-detail/order-history-detail.component';

const canAccessAccount: CanMatchFn = () => {
  const auth = inject(LoginService);
  const router = inject(Router);
  return auth.isLoggedIn() ? true : new RedirectCommand(router.parseUrl('/'));
};

export const routes: Routes = [
  { path: '', component: HomepageComponent },
  { path: 'shopping', component: ShoppingPageComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'wishlist', component: WishlistComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'cart', component: CartComponent },
  { path: 'about', component: AboutComponent },
  { path: 'collection', component: CollectionComponent },
  { path: 'news', component: NewsComponent },
  { path: 'explore', component: ExploreComponent },
  { path: 'director/:slugs', component: DirectorDetailComponent },
  { path: 'directors/:slug', component: DirectorDetailComponent },
  { path: 'account', component: AccountComponent },
  { path: 'films/:id', component: ProductDetailComponent },
  { path: 'order-history-detail/:id', component: OrderHistoryDetailComponent },
  { path: 'gift-code', component: GiftCodeComponent },
  { path: 'gift-a-movie', component: GiftMovieComponent },
  { path: 'search', component: SearchComponent },
  { path: 'faq', component: FaqComponent },


  {
    path: 'order-confirmation',
    loadComponent: () =>
      import('./order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'splash-screen',
    loadComponent: () =>
      import('./splash-screen/splash-screen.component').then(m => m.SplashScreenComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];

// Vergeet niet dit in je hoofd module te importeren:

import { NgModule } from '@angular/core';
import {GiftCodeComponent} from './gift-code/gift-code.component';
import {SearchComponent} from './search/search.component';
import {FaqComponent} from './faq/faq.component';

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
