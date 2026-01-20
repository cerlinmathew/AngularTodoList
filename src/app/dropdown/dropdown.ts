import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Icon } from '../icon/icon';

type FilterType = 'ALL' | 'Completed' | 'Incompleted';

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, Icon],
  templateUrl: './dropdown.html',
})
export class Dropdown {
  isOpen = false;

  selected: FilterType = 'ALL';

  options: FilterType[] = ['ALL', 'Completed', 'Incompleted'];

//   @Output  works on .emit() call

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
