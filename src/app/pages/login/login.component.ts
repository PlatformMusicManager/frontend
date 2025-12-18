import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LibraryService } from '../../services/library.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private libraryService = inject(LibraryService);
    private router = inject(Router);

    ngOnInit() {
        this.libraryService.getMe().subscribe({
            next: () => {
                this.router.navigate(['/main']);
            },
            error: () => {
                // Not logged in, stay on login page
            }
        });
    }

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });

    errorMessage = signal<string | null>(null);

    onSubmit() {
        if (this.loginForm.valid) {
            this.errorMessage.set(null);
            this.authService.login(this.loginForm.value).subscribe({
                next: () => {
                    // Navigate to home or dashboard after success
                    // For now, maybe just log or reload, or navigate to root
                    this.router.navigate(['/']);
                },
                error: (err) => {
                    console.error(err);
                    if (err.status === 406 && err.error?.problem_fields) {
                        const problems = err.error.problem_fields;
                        if (problems.Email) {
                            this.loginForm.get('email')?.setErrors({ serverError: problems.Email });
                        }
                        if (problems.Password) {
                            this.loginForm.get('password')?.setErrors({ serverError: problems.Password });
                        }
                    } else {
                        this.errorMessage.set('Login failed. Please check your credentials.');
                    }
                }
            });
        }
    }
}
