import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomepageComponent} from '../homepage/homepage.component';
import { RouterModule } from '@angular/router';
import { LottieModule, LOTTIE_OPTIONS } from 'ngx-lottie';
import player from 'lottie-web';

export function playerFactory() {
  return player;
}

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    LottieModule,
    HomepageComponent,
  ],
  providers: [
    {
      provide: LOTTIE_OPTIONS,
      useFactory: playerFactory,
    }
  ],
  exports: [HomepageComponent]
})
export class HomepageModule {}
