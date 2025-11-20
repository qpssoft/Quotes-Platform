Feature: Continuous Quote Display with Auto-Rotation
  As a contemplative practitioner
  I want Buddhist quotes to rotate automatically at the top of my screen
  So that I can maintain mindful awareness throughout my day

  Background:
    Given I open the Buddhist quotes application
    And the application has loaded successfully

  Scenario: Initial quote display on page load
    When the page loads
    Then I should see a quote displayed at the top of the screen
    And the quote should occupy approximately 33% of the screen height
    And the quote should include content, author, and category

  Scenario: Automatic quote rotation after 15 seconds
    Given I see the first quote displayed
    When I wait for 15 seconds
    Then a new quote should be displayed
    And the new quote should be different from the previous quote
    And the transition should be smooth with fade animation

  Scenario: Audio notification on quote transition
    Given I see the first quote displayed
    And audio is enabled in my browser
    When the quote rotates to the next one
    Then I should hear a soft notification sound
    And the sound should be calming and Buddhist-inspired

  Scenario: Play/Pause control functionality
    Given I see a quote displayed with auto-rotation active
    When I click the pause button
    Then the auto-rotation should stop
    And the current quote should remain displayed
    When I click the play button
    Then the auto-rotation should resume
    And a new quote should appear after 15 seconds

  Scenario: Next button skips to next quote immediately
    Given I see the first quote displayed
    When I click the next button
    Then a different quote should be displayed immediately
    And the 15-second timer should restart
    And audio notification should play

  Scenario: Consecutive quote prevention
    Given I have seen 5 different quotes
    When quotes continue to rotate
    Then none of the last 5 quotes should appear consecutively
    And I should continue to see new quotes

  Scenario: Error handling for JSON load failure
    Given the quotes.json file is unavailable
    When I open the application
    Then I should see a user-friendly error message
    And the error message should suggest checking internet connection
    And the application should not crash
