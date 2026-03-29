import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum Platform {
    Deezer = "deezer",
    Soundcloud = "soundcloud"
}

@Injectable({
    providedIn: 'root'
})
export class PlatformService {
    private platformSubject = new BehaviorSubject<Platform>(Platform.Deezer);
    public platform$ = this.platformSubject.asObservable();

    constructor() {
        const savedPlatform = localStorage.getItem('platform') as Platform;
        if (savedPlatform && Object.values(Platform).includes(savedPlatform)) {
            this.platformSubject.next(savedPlatform);
        }
    }

    setPlatform(platform: Platform): void {
        localStorage.setItem('platform', platform);
        this.platformSubject.next(platform);
    }

    getCurrentPlatform(): Platform {
        return this.platformSubject.value;
    }
}
