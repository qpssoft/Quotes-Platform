import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteDisplayComponent } from './features/quote-display/quote-display.component';
import { RotationControlsComponent } from './features/controls/rotation-controls.component';
import { QuoteGridComponent } from './features/quote-grid/quote-grid.component';

type ViewType = 'display' | 'grid';

@Component({
  selector: 'app-root',
  imports: [CommonModule, QuoteDisplayComponent, RotationControlsComponent, QuoteGridComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Trích Dẫn Phật Giáo';
  currentView: ViewType = 'display';

  setView(view: ViewType): void {
    this.currentView = view;
  }
}
