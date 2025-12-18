import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LibraryService } from '../../services/library.service';

@Component({
    selector: 'app-verify',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './verify.component.html',
    styleUrl: './verify.component.css'
})
export class VerifyComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private libraryService = inject(LibraryService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    verifyForm = this.fb.group({
        code: ['', [Validators.required, Validators.minLength(6)]]
    });

    status = signal<'idle' | 'verifying' | 'success' | 'error'>('idle');
    message = signal<string>('Enter the verification code sent to your email.');

    ngOnInit() {
        // Check if code is in the URL
        this.route.paramMap.subscribe(params => {
            const code = params.get('code');
            if (code) {
                this.verifyCode(code);
            } else {
                // Only check auth if not verifying a code immediately (optional logic, but safe)
                this.libraryService.getMe().subscribe({
                    next: () => {
                        this.router.navigate(['/main']);
                    },
                    error: () => {
                        // Not logged in, proceed
                    }
                });
            }
        });
    }

    onSubmit() {
        if (this.verifyForm.valid) {
            const code = this.verifyForm.value.code!;
            this.verifyCode(code);
        }
    }

    verifyCode(code: string) {
        this.status.set('verifying');
        this.message.set('Verifying your code...');

        this.authService.verify(code).subscribe({
            next: () => {
                this.status.set('success');
                this.message.set('Verification successful! Redirecting to login...');
                setTimeout(() => this.router.navigate(['/login']), 2000);
            },
            error: (err) => {
                console.error(err);
                this.status.set('error');
                this.message.set('Verification failed. Invalid or expired code.');
            }
        });
    }
}
