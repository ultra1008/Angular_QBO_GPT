import { Component, ViewChild } from '@angular/core';
import { MapInfoWindow, MapMarker } from '@angular/google-maps';

@Component({
  selector: 'app-google',
  templateUrl: './google.component.html',
  styleUrls: ['./google.component.scss'],
})
export class GoogleComponent {
  breadscrums = [
    {
      title: 'Google Map',
      items: ['Map'],
      active: 'Google Map',
    },
  ];

  // basic map start
  display?: google.maps.LatLngLiteral;
  center: google.maps.LatLngLiteral = {
    lat: 24,
    lng: 12,
  };
  zoom = 4;
  moveMap(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.center = event.latLng.toJSON();
  }
  move(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.display = event.latLng.toJSON();
  }

  // basic map end

  //add marker map start

  markerOptions: google.maps.MarkerOptions = {
    draggable: false,
  };
  markerPositions: google.maps.LatLngLiteral[] = [];
  addMarker(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.markerPositions.push(event.latLng.toJSON());
  }

  //add marker map end

  // Google Map Info Window start
  @ViewChild(MapInfoWindow) infoWindow: MapInfoWindow | undefined;
  markerPositions1: google.maps.LatLngLiteral[] = [];
  addMarker1(event: google.maps.MapMouseEvent) {
    if (event.latLng != null) this.markerPositions1.push(event.latLng.toJSON());
  }
  openInfoWindow(marker: MapMarker) {
    if (this.infoWindow != undefined) this.infoWindow.open(marker);
  }

  // Google Map Info Window end

  // Polyline start
  center1: google.maps.LatLngLiteral = {
    lat: 24,
    lng: 12,
  };
  zoom1 = 3;
  vertices: google.maps.LatLngLiteral[] = [
    {
      lat: 13,
      lng: 13,
    },
    {
      lat: -13,
      lng: 0,
    },
    {
      lat: 13,
      lng: -13,
    },
  ];

  // Polyline end
  // trafic layer start
  center2: google.maps.LatLngLiteral = {
    lat: 24,
    lng: 12,
  };
  zoom2 = 4;
  // trafic layer end
}
