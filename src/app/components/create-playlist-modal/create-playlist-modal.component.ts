import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

@Component({
    selector: 'app-create-playlist-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './create-playlist-modal.component.html',
    styleUrls: ['./create-playlist-modal.component.css']
})
export class CreatePlaylistModalComponent {
    public dialogRef = inject(DialogRef<string>);
    public data = inject(DIALOG_DATA, { optional: true });

    playlistTitle: string = '';

    onCreate() {
        if (this.playlistTitle.trim()) {
            this.dialogRef.close(this.playlistTitle);
        }
    }

    onCancel() {
        this.dialogRef.close();
    }
}
