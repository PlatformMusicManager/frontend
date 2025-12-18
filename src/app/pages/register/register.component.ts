import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LibraryService } from '../../services/library.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.css' // We can reuse the same style if we want, but for now separate file
})
export class RegisterComponent implements OnInit {
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
                // Not logged in, proceed
            }
        });
    }

    registerForm = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
    });

    errorMessage = signal<string | null>(null);

    onSubmit() {
        if (this.registerForm.valid) {
            this.errorMessage.set(null);
            this.authService.register(this.registerForm.value).subscribe({
                next: () => {
                    // On successful register, navigate to verify
                    this.router.navigate(['/verify']);
                },
                error: (err) => {
                    console.error(err);
                    if (err.status === 406 && err.error?.problem_fields) {
                        const problems = err.error.problem_fields;
                        if (problems.Username) {
                            this.registerForm.get('username')?.setErrors({ serverError: problems.Username });
                        }
                        if (problems.Email) {
                            this.registerForm.get('email')?.setErrors({ serverError: problems.Email });
                        }
                        if (problems.Password) {
                            this.registerForm.get('password')?.setErrors({ serverError: problems.Password });
                        }
                    } else {
                        this.errorMessage.set('Registration failed. Username or Email might be taken.');
                    }
                }
            });
        }
    }
}
