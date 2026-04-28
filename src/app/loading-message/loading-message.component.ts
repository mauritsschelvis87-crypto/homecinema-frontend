import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { map } from 'rxjs';
import { LoadingService } from '../services/loading.service';

@Component({
  selector: 'app-loading-message',
  standalone: true,
  imports: [NgIf, AsyncPipe],
  templateUrl: './loading-message.component.html',
  styleUrl: './loading-message.component.scss',
})
export class LoadingMessageComponent {
  readonly isLoading$;

  constructor(private loadingService: LoadingService) {
    this.isLoading$ = this.loadingService.isLoading$.pipe(map((pendingRequests) => pendingRequests > 0));
  }
}
