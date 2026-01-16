import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

type FilterType = 'ALL' | 'Completed' | 'Incompleted';

@Component({
  selector: 'app-dropdown',
  imports: [CommonModule],
  templateUrl: './dropdown.html',
})
export class Dropdown {
  isOpen = false;

  selected: FilterType = 'ALL';

  options: FilterType[] = ['ALL', 'Completed', 'Incompleted'];

  @Output() filterChange = new EventEmitter<FilterType>();

  toggle() {
    this.isOpen = !this.isOpen;
  }

  selectOption(option: FilterType) {
    this.selected = option;
    this.filterChange.emit(option);
    this.isOpen = false;
  }
}
