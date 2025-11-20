/**
 * Rotation Service Unit Tests
 */

import { RotationService } from '../../src/services/rotation.service';
import { Quote, QuoteType, Language, createQuote } from '../../src/models/quote.model';
import { generateUUID } from '../../src/utils/uuid';

describe('RotationService', () => {
  let rotationService: RotationService;
  let testQuotes: Quote[];

  beforeEach(() => {
    rotationService = new RotationService();

    testQuotes = [
      createQuote(
        generateUUID(),
        'Quote 1',
        'Author 1',
        QuoteType.BuddhistQuote,
        'Category 1',
        ['tag1'],
        Language.English
      ),
      createQuote(
        generateUUID(),
        'Quote 2',
        'Author 2',
        QuoteType.LifeLesson,
        'Category 2',
        ['tag2'],
        Language.English
      ),
      createQuote(
        generateUUID(),
        'Quote 3',
        'Author 3',
        QuoteType.WisdomSaying,
        'Category 3',
        ['tag3'],
        Language.English
      )
    ];
  });

  describe('initialize()', () => {
    it('should set configuration', () => {
      rotationService.initialize({
        interval: 20,
        soundEnabled: false,
        hapticEnabled: true,
        recentQuotesLimit: 5
      });

      const state = rotationService.getState();
      expect(state).toBeDefined();
    });
  });

  describe('start()', () => {
    it('should start rotation with initial quote', () => {
      const initialQuote = rotationService.start(testQuotes);

      expect(initialQuote).toBeDefined();
      expect(testQuotes).toContainEqual(initialQuote);

      const state = rotationService.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.currentQuote).toBe(initialQuote);
      expect(state.recentQuoteIds.length).toBe(1);
    });

    it('should throw error when starting with empty quotes array', () => {
      expect(() => rotationService.start([])).toThrow('Cannot start rotation with empty quotes array');
    });
  });

  describe('pause() and resume()', () => {
    it('should pause rotation', () => {
      rotationService.start(testQuotes);
      rotationService.pause();

      const state = rotationService.getState();
      expect(state.isPlaying).toBe(false);
      expect(state.nextTransitionAt).toBeNull();
    });

    it('should resume rotation', () => {
      rotationService.start(testQuotes);
      rotationService.pause();
      rotationService.resume();

      const state = rotationService.getState();
      expect(state.isPlaying).toBe(true);
      expect(state.nextTransitionAt).not.toBeNull();
    });
  });

  describe('stop()', () => {
    it('should stop rotation and reset state', () => {
      rotationService.start(testQuotes);
      rotationService.stop();

      const state = rotationService.getState();
      expect(state.isPlaying).toBe(false);
      expect(state.currentQuote).toBeNull();
      expect(state.recentQuoteIds.length).toBe(0);
    });
  });

  describe('next()', () => {
    it('should advance to next quote', () => {
      const initialQuote = rotationService.start(testQuotes);
      const nextQuote = rotationService.next(testQuotes);

      expect(nextQuote).toBeDefined();
      expect(nextQuote.id).not.toBe(initialQuote.id);

      const state = rotationService.getState();
      expect(state.currentQuote).toBe(nextQuote);
    });

    it('should track recent quotes', () => {
      rotationService.initialize({ interval: 15, soundEnabled: true, hapticEnabled: false, recentQuotesLimit: 2 });
      rotationService.start(testQuotes);
      rotationService.next(testQuotes);
      rotationService.next(testQuotes);

      const state = rotationService.getState();
      expect(state.recentQuoteIds.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getRandomQuote()', () => {
    it('should return random quote from pool', () => {
      const quote = rotationService.getRandomQuote(testQuotes);
      expect(testQuotes).toContainEqual(quote);
    });

    it('should exclude recent quotes', () => {
      rotationService.start(testQuotes);
      const quote1 = rotationService.next(testQuotes);
      const quote2 = rotationService.next(testQuotes);

      expect(quote1.id).not.toBe(quote2.id);
    });

    it('should throw error with empty array', () => {
      expect(() => rotationService.getRandomQuote([])).toThrow('Cannot select random quote from empty array');
    });
  });

  describe('onTransition callback', () => {
    it('should trigger callback on next()', (done) => {
      rotationService.onTransition((quote) => {
        expect(quote).toBeDefined();
        done();
      });

      rotationService.start(testQuotes);
      rotationService.next(testQuotes);
    });
  });
});
