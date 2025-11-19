import { Component, inject, signal, OnInit, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../core/services/data.service';
import { StorageService } from '../../core/services/storage.service';
import { QuoteCardComponent } from '../../shared/components/quote-card/quote-card.component';
import { Quote } from '../../core/models';

/**
 * Quote grid component for browsing quotes
 * Displays configurable number of quotes in a responsive grid layout
 * Includes search functionality for filtering quotes and font selection
 */
@Component({
  selector: 'app-quote-grid',
  standalone: true,
  imports: [CommonModule, QuoteCardComponent, FormsModule],
  templateUrl: './quote-grid.component.html',
  styleUrl: './quote-grid.component.scss'
})
export class QuoteGridComponent implements OnInit {
  private dataService = inject(DataService);
  private storageService = inject(StorageService);

  // All quotes loaded from service
  private allQuotes = signal<Quote[]>([]);
  
  // Search query signal
  searchQuery = signal<string>('');
  
  // Display count signal (number of quotes to show)
  displayCount = signal<number>(5);
  
  // Font family signal
  selectedFont = signal<string>('Noto Serif');
  
  // Loading state
  isLoading = signal<boolean>(true);
  
  // Available display count options
  displayCountOptions = [5, 10, 12, 15, 20, 25, 30];
  
  // Available font options
  fontOptions = [
    { value: 'Noto Serif', label: 'Noto Serif (Mặc định)' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'Lora', label: 'Lora' },
    { value: 'Playfair Display', label: 'Playfair Display' },
    { value: 'Crimson Text', label: 'Crimson Text' }
  ];

  // Computed filtered quotes based on search query and display count
  filteredQuotes = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const quotes = this.allQuotes();
    const count = this.displayCount();
    
    if (!query) {
      // No search - return quotes up to display count
      return quotes.slice(0, count);
    }
    
    // Filter quotes by search query (content, author, or category)
    const filtered = quotes.filter(quote => 
      quote.content.toLowerCase().includes(query) ||
      quote.author.toLowerCase().includes(query) ||
      quote.category.toLowerCase().includes(query)
    );
    
    // Limit filtered results to display count
    return filtered.slice(0, count);
  });

  async ngOnInit(): Promise<void> {
    // Load saved preferences
    this.loadPreferences();
    
    await this.loadAllQuotes();
    
    // Apply saved font
    this.applyFont(this.selectedFont());
  }

  /**
   * Load all quotes from service
   */
  private async loadAllQuotes(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      const quotes = await this.dataService.loadQuotes();
      
      if (quotes.length === 0) {
        this.isLoading.set(false);
        return;
      }

      // Shuffle quotes for random display
      const shuffled = [...quotes].sort(() => Math.random() - 0.5);
      this.allQuotes.set(shuffled);
    } catch (error) {
      console.error('Failed to load quotes:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Handle search input change
   */
  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  /**
   * Clear search query
   */
  clearSearch(): void {
    this.searchQuery.set('');
  }

  /**
   * Handle display count change
   */
  onDisplayCountChange(count: number): void {
    this.displayCount.set(count);
    this.savePreferences();
  }

  /**
   * Handle font change
   */
  onFontChange(font: string): void {
    this.selectedFont.set(font);
    this.applyFont(font);
    this.savePreferences();
  }

  /**
   * Apply font to document
   */
  private applyFont(font: string): void {
    // Apply font globally to all quotes with proper CSS formatting
    // If font name has spaces, it needs quotes in CSS
    const fontFamily = font.includes(' ') ? `"${font}", serif` : `${font}, serif`;
    document.documentElement.style.setProperty('--quote-font-family', fontFamily);
    console.log('Applied font:', fontFamily);
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): void {
    const preferences = this.storageService.loadPreferences();
    if (preferences) {
      if (preferences.displayCount) {
        this.displayCount.set(preferences.displayCount);
      }
      if (preferences.fontFamily) {
        this.selectedFont.set(preferences.fontFamily);
      }
    }
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    const preferences = this.storageService.loadPreferences() || {
      timerInterval: 15,
      storageKey: 'buddhist-quotes-preferences'
    };
    
    preferences.displayCount = this.displayCount();
    preferences.fontFamily = this.selectedFont();
    
    this.storageService.savePreferences(preferences);
  }

  /**
   * Refresh grid with new random quotes
   */
  async refreshGrid(): Promise<void> {
    await this.loadAllQuotes();
  }
}
