Feature: Quote Search and Filtering
  As a contemplative practitioner
  I want to search and filter quotes
  So that I can find teachings relevant to my current focus

  Background:
    Given I open the Buddhist quotes application
    And the application has loaded successfully
    And the quote grid is visible

  Scenario: Full-text search across quote content
    When I type "compassion" in the search box
    Then the grid should display only quotes containing "compassion" in content
    And the results should update in real-time as I type
    And the display count should show the number of matching quotes

  Scenario: Search across author names
    When I type "Thích Nhất Hạnh" in the search box
    Then the grid should display only quotes by "Thích Nhất Hạnh"
    And Vietnamese diacritics in author names should match correctly

  Scenario: Search across categories
    When I type "wisdom" in the search box
    Then the grid should display quotes from the wisdom category
    And quotes with "wisdom" in content or author should also appear

  Scenario: Case-insensitive search
    When I type "BUDDHA" in uppercase
    Then the results should match "Buddha", "buddha", and "BUDDHA"
    And the search should be case-insensitive

  Scenario: Clear search with X button
    Given I have searched for "mindfulness"
    And I see filtered results
    When I click the clear search button (X icon)
    Then the search box should be empty
    And all quotes should be displayed again
    And the grid should return to the default view

  Scenario: No results message
    When I type "xyznonexistent" in the search box
    Then I should see a "No quotes found" message
    And the message should be clear and helpful
    And no quote cards should be displayed

  Scenario: Change display count to 10 quotes
    Given the default display count is 5
    When I select "10" from the display count dropdown
    Then the grid should show 10 quotes
    And the layout should adjust appropriately
    And scrolling should work if needed

  Scenario: Display count persists with search
    Given I have set display count to "15"
    When I search for "peace"
    Then the grid should show up to 15 matching quotes
    And the display count setting should be maintained

  Scenario: Font selection changes quote typography
    Given quotes are displayed in the default "Noto Serif" font
    When I select "Georgia" from the font dropdown
    Then all quote content should change to Georgia font
    And the font should apply to both continuous display and grid
    And readability should be maintained

  Scenario: Font selection persists across navigation
    Given I have selected "Merriweather" font
    When I refresh the page
    Then the quotes should still display in Merriweather font
    And my font preference should be remembered

  Scenario: Search performance with large dataset
    Given the application has loaded 75 quotes
    When I type a search term
    Then results should appear in less than 500 milliseconds
    And the UI should remain responsive
    And there should be no noticeable lag

  Scenario: Responsive filter controls on mobile
    Given I am viewing the application on a mobile device
    When I view the filter controls
    Then the search box, display count, and font selector should stack vertically
    And all controls should be easily tappable (44x44px minimum)
    And the layout should not cause horizontal scrolling
