// import { Component, Input, Output, EventEmitter } from '@angular/core';
// import {RouterLink, RouterLinkActive} from '@angular/router';
// import {FormsModule} from '@angular/forms';
// import {NgForOf} from '@angular/common';
//
// @Component({
//   selector: 'app-navbar-collection',
//   templateUrl: './navbar-collection.component.html',
//   standalone: true,
//   imports: [
//     RouterLinkActive,
//     RouterLink,
//     FormsModule,
//     NgForOf
//   ],
//   // imports ...
// })
// export class NavbarCollectionComponent {
//   @Input() countries: string[] = [];
//   @Input() directors: string[] = [];
//   @Input() years: number[] = [];
//   @Input() types: string[] = [];
//   @Input() brands: string[] = [];
//
//   filters = {
//     title: '',
//     country: '',
//     director: '',
//     year: '',
//     type: '',
//     brand: ''
//   };
//
//   @Output() filtersChanged = new EventEmitter<typeof this.filters>();
//
//   onFiltersChange() {
//     this.filtersChanged.emit(this.filters);
//   }
// }
