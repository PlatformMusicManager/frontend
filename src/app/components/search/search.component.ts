import { Component, output, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  imports: [ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent {
  searchControl = new FormControl('');

  valueChanged = output<string>();
  enterPressed = output<string>();

  ngOnInit() {
    this.searchControl.valueChanges.subscribe((val) => {
      this.valueChanged.emit(val || '');
    });
  }

  onEnterPressed() {
    this.enterPressed.emit(this.searchControl.value || '');
  }
}
