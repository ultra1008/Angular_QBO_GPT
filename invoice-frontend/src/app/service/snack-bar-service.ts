import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2'

@Injectable({ providedIn: 'root' })
export class Snackbarservice {
    constructor() { }

    openSnackBar(message: string, action: string) {
        const Toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
        if (action == 'success') {
            Toast.fire({
                icon: action,
                title: message
            })
        } else if (action == 'warning') {
            Toast.fire({
                icon: action,
                title: message
            })
        }
        else if (action == 'info') {
            Toast.fire({
                icon: action,
                title: message
            })
        }
        else {
            Toast.fire({
                icon: "error",
                title: message
            })
        }
    }

    handleError(error: any) {
        if (error.error instanceof Error) {

            let errMessage = error.error.message;
            return throwError(errMessage);
        }
        return throwError(error);
    }
}


