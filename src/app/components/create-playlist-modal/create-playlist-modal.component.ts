import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';

@Component({
    selector: 'app-create-playlist-modal',
    standalone: true,
    imports: [CommonModule, FormsModule, ModalComponent],
    templateUrl: './create-playlist-modal.component.html',
    styleUrls: ['./create-playlist-modal.component.css']
})
export class CreatePlaylistModalComponent {
    @Output() create = new EventEmitter<string>();
    @Output() cancel = new EventEmitter<void>();

    playlistTitle: string = '';

    onCreate() {
        if (this.playlistTitle.trim()) {
            this.create.emit(this.playlistTitle);
            this.playlistTitle = '';
        }
    }

    onCancel() {
        this.cancel.emit();
        this.playlistTitle = '';
    }
}
