import { Component, input } from '@angular/core';

@Component({
  selector: 'app-round-hoverable-button',
  imports: [],
  templateUrl: './round-hoverable-button.component.html',
  styleUrl: './round-hoverable-button.component.css',
})
export class RoundHoverableButtonComponent {
  isActive = input<boolean>(false);
  backgroundColor = input<string>('transparent');
  size = input<'small' | 'medium' | 'large'>('medium');
}
