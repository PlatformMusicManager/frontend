import {
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  Renderer2,
} from '@angular/core';
import { ContextMenuService } from '../../services/context-menu.service';

@Component({
  selector: 'app-context-menu',
  imports: [],
  templateUrl: './context-menu.component.html',
  styleUrl: './context-menu.component.css',
})
export class ContextMenuComponent {
  private element = inject(ElementRef);
  private renderer = inject(Renderer2);
  private contextMenuService = inject(ContextMenuService);
  private contextMenuOptions = this.contextMenuService.contextMenuOptions;

  private screenWidth = window.innerWidth;
  private screenHeight = window.innerHeight;

  private elementHeight = 50;
  private elementWidth = 300;

  constructor() {
    this.renderer.setProperty(this.element, 'style.position', 'absolute');
    this.renderer.setProperty(this.element, 'style.display', 'none');
    this.renderer.setProperty(this.element, 'style.width', this.elementWidth + 'px');
    this.renderer.setProperty(this.element, 'style.height', this.elementHeight + 'px');
    effect(() => {
      const options = this.contextMenuOptions();

      if (!options) return this.renderer.setProperty(this.element, 'style.display', 'none');
      this.renderer.setProperty(this.element, 'style.display', 'flex');

      let y = options.position.y;
      if (options.openAt === 'middle')
        y -= this.elementHeight / 2 + options.elementBounds.height / 2;
      if (y < window.scrollY) y = window.scrollY;
      if (y + this.elementHeight > this.screenHeight)
        y = this.screenHeight - this.elementHeight + window.scrollY;

      let x = options.position.x + options.elementBounds.width;
      if (x + this.elementWidth > this.screenWidth + window.scrollX) {
        x -= this.elementWidth + options.elementBounds.width;
        if (x < window.scrollX) x = window.scrollX;
      }

      this.renderer.setProperty(this.element, 'style.top', y + 'px');
      this.renderer.setProperty(this.element, 'style.left', x + 'px');
    });
  }

  isOpen = computed(() => this.contextMenuOptions() !== null);
  options = computed(() => this.contextMenuOptions()?.options || []);
}
