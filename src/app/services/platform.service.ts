import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Platform = 'DEEZER' | 'SOUNDCLOUD';

@Injectable({
    providedIn: 'root'
})
export class PlatformService {
    private platformSubject = new BehaviorSubject<Platform>('DEEZER');
    public platform$ = this.platformSubject.asObservable();

    constructor() { }

    setPlatform(platform: Platform): void {
        this.platformSubject.next(platform);
    }

    getCurrentPlatform(): Platform {
        return this.platformSubject.value;
    }
}
