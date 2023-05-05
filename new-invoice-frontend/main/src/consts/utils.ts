import { MatSnackBar } from "@angular/material/snack-bar";
import { DomSanitizer } from "@angular/platform-browser";
import { NgxGalleryAnimation, NgxGalleryImageSize } from "ngx-gallery-9";
import Swal from "sweetalert2";

export const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
        confirmButton: "btn btn-success s2-confirm margin-right-cust",
        denyButton: "btn btn-danger s2-confirm",
        cancelButton: "s2-confirm btn btn-gray ml-2",
    },
    buttonsStyling: false,
    allowOutsideClick: false,
    imageUrl: './assets/images/rovukinvoice.png',
    imageHeight: 50,
    imageAlt: 'A branding image'
});

export const swalWithBootstrapTwoButtons = Swal.mixin({
    customClass: {
        confirmButton: "btn btn-success s2-confirm mr-2",
        denyButton: "btn btn-danger s2-confirm ml-2",
    },
    buttonsStyling: false,
    allowOutsideClick: false,
    imageUrl: './assets/images/rovukinvoice.png',
    imageHeight: 50,
    imageAlt: 'A branding image'
});

export function showNotification(snackBar: MatSnackBar, text: string, colorName: string) {
    snackBar.open(text, '', {
        duration: 5000,
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

export function commonNewtworkAttachmentViewer(attachements: Array<string>) {
    const images = [];
    if (attachements != undefined) {
        for (let i = 0; i < attachements.length; i++) {
            const extension = attachements[i].substring(attachements[i].lastIndexOf(".") + 1);
            if (extension == "jpg" || extension == "png" || extension == "jpeg" || extension == "gif" || extension == "webp") {
                const srctmp = {
                    small: attachements[i],
                    medium: attachements[i],
                    big: attachements[i],
                };
                images.push(srctmp);
            } else if (extension == "doc" || extension == "docx") {
                const srctmp = {
                    small: "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
                    medium: "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
                    big: "https://s3.us-west-1.wasabisys.com/rovukdata/doc_big.png",
                };
                images.push(srctmp);
            } else if (extension == "pdf") {
                const srctmp = {
                    small: "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
                    medium: "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
                    big: "https://s3.us-west-1.wasabisys.com/rovukdata/pdf_big.png",
                };
                images.push(srctmp);
            } else if (extension == "odt") {
                const srctmp = {
                    small: "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
                    medium: "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
                    big: "https://s3.us-west-1.wasabisys.com/rovukdata/odt_big.png",
                };
                images.push(srctmp);
            } else if (extension == "rtf") {
                const srctmp = {
                    small: "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
                    medium: "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
                    big: "https://s3.us-west-1.wasabisys.com/rovukdata/rtf_big.png",
                };
                images.push(srctmp);
            } else if (extension == "txt") {
                const srctmp = {
                    small: "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
                    medium: "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
                    big: "https://s3.us-west-1.wasabisys.com/rovukdata/txt_big.png",
                };
                images.push(srctmp);
            } else if (extension == "ppt") {
                const srctmp = {
                    small: "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
                    medium: "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
                    big: "https://s3.us-west-1.wasabisys.com/rovukdata/ppt_big.png",
                };
                images.push(srctmp);
            } else if (extension == "xls" || extension == "xlsx" || extension == "csv") {
                const srctmp = {
                    small: "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
                    medium: "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
                    big: "https://s3.us-west-1.wasabisys.com/rovukdata/xls_big.png",
                };
                images.push(srctmp);
            } else if (extension == "zip") {
                const srctmp = {
                    small: "https://s3.us-west-1.wasabisys.com/rovukdata/zip_big.png",
                    medium: "https://s3.us-west-1.wasabisys.com/rovukdata/zip_big.png",
                    big: "https://s3.us-west-1.wasabisys.com/rovukdata/zip_big.png",
                };
                images.push(srctmp);
            } else {
                const srctmp = {
                    small: "https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png",
                    medium: "https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png",
                    big: "https://s3.us-west-1.wasabisys.com/rovukdata/nopreview_big.png",
                };
                images.push(srctmp);
            }
        }
    }
    return images;
}

export function commonNetworkThumbImage(url: string) {
    const extension = url.substring(url.lastIndexOf(".") + 1);
    if (extension == "doc" || extension == "docx") {
        return "https://s3.us-west-1.wasabisys.com/rovukdata/doc.png";
    } else if (extension == "pdf") {
        return "https://s3.us-west-1.wasabisys.com/rovukdata/pdf.png";
    } else if (extension == "xls" || extension == "xlsx" || extension == "csv") {
        return "https://s3.us-west-1.wasabisys.com/rovukdata/xls.png";
    } else if (extension == "zip") {
        return "https://s3.us-west-1.wasabisys.com/rovukdata/zip.png";
    } else if (extension == "ppt") {
        return "https://s3.us-west-1.wasabisys.com/rovukdata/ppt.png";
    } else if (extension == "rtf") {
        return "https://s3.us-west-1.wasabisys.com/rovukdata/rtf.png";
    } else if (extension == "odt") {
        return "https://s3.us-west-1.wasabisys.com/rovukdata/odt.png";
    } else if (extension == "txt") {
        return "https://s3.us-west-1.wasabisys.com/rovukdata/txt.png";
    } else if (extension == "jpg" || extension == "png" || extension == "jpeg" || extension == "gif" || extension == "webp") {
        return url;
    } else {
        return "https://s3.us-west-1.wasabisys.com/rovukdata/no-preview.png";
    }
}

export function commonLocalThumbImage(sanitiser: DomSanitizer, file: File) {
    switch (file.type) {
        case "application/pdf":
            return "https://s3.us-west-1.wasabisys.com/rovukdata/pdf.png";
            break;
        case "image/png":
            return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
            break;
        case "image/jpeg":
            return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
            break;
        case "image/jpg":
            return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
            break;
        case "image/gif":
            return sanitiser.bypassSecurityTrustUrl(URL.createObjectURL(file));
            break;
        case "application/msword":
        case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            return "https://s3.us-west-1.wasabisys.com/rovukdata/doc.png";
            break;
        case "application/vnd.ms-excel":
        case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
            return "https://s3.us-west-1.wasabisys.com/rovukdata/xls.png";
            break;
        case "application/vnd.oasis.opendocument.text":
            return "https://s3.us-west-1.wasabisys.com/rovukdata/odt.png";
            break;
        case "application/zip":
            return "https://s3.us-west-1.wasabisys.com/rovukdata/zip.png";
            break;
        case "image/svg+xml":
            return "../../../../../../assets/images/svg.png";
            break;
        case "application/vnd.ms-powerpoint":
            return "https://s3.us-west-1.wasabisys.com/rovukdata/ppt.png";
            break;
        default:
            return "https://s3.us-west-1.wasabisys.com/rovukdata/no-preview.png";
            break;
    }
}

export function isValidMailFormat(email: string): any {
    const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (email != "" && EMAIL_REGEXP.test(email)) {
        return { "Please provide a valid email": true };
    }
    return null;
}