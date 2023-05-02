import { Component } from '@angular/core';
import {
  MatBottomSheet,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
@Component({
  selector: 'app-bottom-sheet',
  templateUrl: './bottom-sheet.component.html',
  styleUrls: ['./bottom-sheet.component.scss'],
})
export class BottomSheetComponent {
  breadscrums = [
    {
      title: 'Bottom Sheed',
      items: ['UI'],
      active: 'Bottom Sheet',
    },
  ];

  constructor(private _bottomSheet: MatBottomSheet) {}
  openBottomSheet(): void {
    this._bottomSheet.open(BottomSheetOverviewExampleSheetComponent);
  }
}
@Component({
  selector: 'app-bottom-sheet-overview-example-sheet',
  templateUrl: 'bottom-sheet-overview-example-sheet.html',
})
export class BottomSheetOverviewExampleSheetComponent {
  constructor(
    private _bottomSheetRef: MatBottomSheetRef<BottomSheetOverviewExampleSheetComponent>
  ) {}
  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }
}
