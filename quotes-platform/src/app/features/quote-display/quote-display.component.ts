import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { QuoteCardComponent } from '../../shared/components/quote-card/quote-card.component';
import { RotationService } from '../../core/services/rotation.service';

/**
 * Continuous quote display component (top 1/3 of screen)
 * Shows auto-rotating Buddhist quotes with fade transitions
 */
@Component({
  selector: 'app-quote-display',
  standalone: true,
  imports: [CommonModule, QuoteCardComponent],
  templateUrl: './quote-display.component.html',
  styleUrl: './quote-display.component.scss',
  animations: [
    trigger('fadeInOut', [
      state('in', style({ opacity: 1 })),
      transition(':enter', [
        style({ opacity: 0 }),
        animate('500ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('500ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class QuoteDisplayComponent implements OnInit, OnDestroy {
  private rotationService = inject(RotationService);

  // Reactive signals from rotation service
  currentQuote = this.rotationService.currentQuote;
  isPlaying = this.rotationService.timer;
  error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    try {
      // Start rotation on component init
      await this.rotationService.start();
    } catch (err) {
      this.error.set('Unable to load quotes. Please check your internet connection and try again.');
      console.error('Failed to start rotation:', err);
    }
  }

  ngOnDestroy(): void {
    // Pause rotation when component is destroyed
    this.rotationService.pause();
  }
}
