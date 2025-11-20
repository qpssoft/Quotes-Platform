Feature: Configurable Meditation Timer
  As a contemplative practitioner
  I want to customize the quote rotation interval
  So that I can adjust the pace to match my meditation practice

  Background:
    Given I open the Buddhist quotes application
    And the application has loaded successfully

  Scenario: Default timer interval is 15 seconds
    When the page loads
    Then the timer dropdown should show "15 seconds" selected
    And quotes should rotate every 15 seconds

  Scenario: Change timer interval to 30 seconds
    Given I see the timer dropdown set to "15 seconds"
    When I select "30 seconds" from the timer dropdown
    Then the timer dropdown should show "30 seconds" selected
    And the next quote should appear after 30 seconds
    And subsequent quotes should rotate every 30 seconds

  Scenario: Timer preference persists across sessions
    Given I have set the timer to "45 seconds"
    When I refresh the page
    Then the timer dropdown should show "45 seconds" selected
    And quotes should rotate every 45 seconds

  Scenario: Timer change takes effect immediately when paused
    Given I have paused the quote rotation
    When I change the timer to "10 seconds"
    And I resume the rotation
    Then the next quote should appear after 10 seconds

  Scenario: Timer change takes effect on next interval when playing
    Given quotes are rotating every 15 seconds
    And 5 seconds have passed since the last rotation
    When I change the timer to "20 seconds"
    Then the current quote should complete its remaining 10 seconds
    And subsequent quotes should rotate every 20 seconds

  Scenario: All timer options are available
    When I click the timer dropdown
    Then I should see options for: 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60 seconds
    And all options should be selectable

  Scenario: localStorage unavailable handling
    Given localStorage is disabled in my browser
    When I change the timer setting
    Then the timer should work with the new setting
    And the application should not display an error
    And the timer should reset to 15 seconds on page refresh
