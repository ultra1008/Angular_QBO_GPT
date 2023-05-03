import { MatSnackBar } from "@angular/material/snack-bar";

export function showNotification(snackBar: MatSnackBar, text: string, colorName: string) {
    snackBar.open(text, '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: colorName == 'success' ? 'snackbar-success' : 'snackbar-danger',
    });
} 