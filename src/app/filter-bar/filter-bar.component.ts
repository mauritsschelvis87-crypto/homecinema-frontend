import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  imports: [
    FormsModule
],
  styleUrls: ['./filter-bar.component.scss']
})
export class FilterBarComponent {
  @Input() countries: string[] = [];
  @Input() directors: string[] = [];
  @Input() years: number[] = [];
  @Input() types: string[] = [];
  @Input() brands: string[] = [];

  @Output() filtersChanged = new EventEmitter<{
    title: string;
    country: string;
    director: string;
    year: string;
    type: string;
    brand: string;
  }>();

  title: string = '';
  selectedCountry: string = '';
  selectedDirector: string = '';
  selectedYear: string = '';
  selectedType: string = '';
  selectedBrand: string = '';

  emitFilters() {
    this.filtersChanged.emit({
      title: this.title,
      country: this.selectedCountry,
      director: this.selectedDirector,
      year: this.selectedYear,
      type: this.selectedType,
      brand: this.selectedBrand
    });
  }

  resetFilters() {
    this.title = '';
    this.selectedCountry = '';
    this.selectedDirector = '';
    this.selectedYear = '';
    this.selectedType = '';
    this.selectedBrand = '';
    this.emitFilters();
  }
}
