import { Component, computed, effect, ElementRef, inject, Renderer2 } from '@angular/core';
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
    this.renderer.setStyle(this.element.nativeElement, 'position', 'fixed');
    this.renderer.setStyle(this.element.nativeElement, 'display', 'none');
    this.renderer.setStyle(this.element.nativeElement, 'width', this.elementWidth + 'px');
    this.renderer.setStyle(this.element.nativeElement, 'height', '0px');
    effect(() => {
      const options = this.contextMenuOptions();
      if (!options) return;

      const menuHeight = this.elementHeight * options.options.length;

      if (!options) {
        this.renderer.setStyle(this.element.nativeElement, 'display', 'none');
        return;
      }
      this.renderer.setStyle(this.element.nativeElement, 'display', 'flex');

      let y = options.position.y;
      if (options.openAt === 'middle') y += options.elementBounds.height / 2 - menuHeight / 2;
      if (y < 0) y = 0;
      if (y + menuHeight > this.screenHeight) y = this.screenHeight - menuHeight;

      let x = options.position.x + options.elementBounds.width;
      if (x + this.elementWidth > this.screenWidth) {
        x = options.position.x - this.elementWidth;
        if (x < 0) x = 0;
      }

      this.renderer.setStyle(this.element.nativeElement, 'top', y + 'px');
      this.renderer.setStyle(this.element.nativeElement, 'left', x + 'px');
      this.renderer.setStyle(this.element.nativeElement, 'height', menuHeight + 'px');
    });

    this.renderer.listen('document', 'click', (e: MouseEvent) => {
      if (this.isOpen() && !this.element.nativeElement.contains(e.target as Node)) {
        this.contextMenuService.closeContextMenu();
      }
    });
  }

  isOpen = computed(() => this.contextMenuOptions() !== null);
  options = computed(() => this.contextMenuOptions()?.options || []);
}
