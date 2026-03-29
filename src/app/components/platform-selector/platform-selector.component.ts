import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlatformService, Platform } from '../../services/platform.service';

@Component({
    selector: 'app-platform-selector',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './platform-selector.component.html',
    styleUrls: ['./platform-selector.component.css']
})
export class PlatformSelectorComponent {
    private platformService = inject(PlatformService);
    currentPlatform$ = this.platformService.platform$;
    Platform = Platform;

    setPlatform(platform: Platform): void {
        this.platformService.setPlatform(platform);
    }
}
