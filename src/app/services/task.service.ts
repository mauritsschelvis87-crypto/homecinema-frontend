import {inject, Injectable, Signal, signal} from '@angular/core';
import {Task} from '../models/task';
import { HttpClient } from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks = signal<Task[]>([]);
  private httpClient = inject(HttpClient);

  public getTasks(){
    return this.tasks.asReadonly()
  }

  public loadTasks() {
    console.log("Getting tasks")
    this.httpClient.get<Task[]>(environment.apiUrl + '/task').subscribe({
      next: (responseData) => {
        console.log(responseData)
        this.tasks.set( responseData);
      }
    });
  }
}
