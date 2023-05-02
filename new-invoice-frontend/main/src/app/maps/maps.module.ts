import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { MapsRoutingModule } from './maps-routing.module';
import { GoogleComponent } from './google/google.component';
import { ComponentsModule } from '../shared/components/components.module';

@NgModule({
  declarations: [GoogleComponent],
  imports: [
    CommonModule,
    MapsRoutingModule,
    GoogleMapsModule,
    ComponentsModule,
  ],
})
export class MapsModule {}
