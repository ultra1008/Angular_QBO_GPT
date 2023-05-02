import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaRoutingModule } from './media-routing.module';
import { GalleryComponent } from './gallery/gallery.component';
import { NgImageFullscreenViewModule } from 'ng-image-fullscreen-view';
import { ComponentsModule } from '../shared/components/components.module';
@NgModule({
  declarations: [GalleryComponent],
  imports: [
    CommonModule,
    MediaRoutingModule,
    NgImageFullscreenViewModule,
    ComponentsModule,
  ],
})
export class MediaModule {}
