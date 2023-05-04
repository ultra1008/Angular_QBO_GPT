import { MatSnackBar } from "@angular/material/snack-bar";
import { NgxGalleryAnimation, NgxGalleryImageSize } from "ngx-gallery-9";

export function showNotification(snackBar: MatSnackBar, text: string, colorName: string) {
    snackBar.open(text, '', {
        duration: 2000,
        verticalPosition: 'top',
        horizontalPosition: 'right',
        panelClass: colorName == 'success' ? 'snackbar-success' : 'snackbar-danger',
    });
}

export function gallery_options() {
    return {
        width: '0px',
        height: '0px',
        imageArrowsAutoHide: true,
        imageAutoPlay: false,
        thumbnails: false,
        preview: true,
        image: false,
        thumbnailsColumns: 4,
        imagePercent: 50,
        previewFullscreen: true,
        imageSize: NgxGalleryImageSize.Contain,
        previewZoom: true,
        previewRotate: true,
        previewCloseOnClick: true,
        previewCloseOnEsc: true,
        previewAutoPlay: false,
        imageAnimation: NgxGalleryAnimation.Fade,
        actions: []
    };
}