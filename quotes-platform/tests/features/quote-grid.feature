Feature: Quote Grid Browsing
  As a contemplative practitioner
  I want to browse multiple quotes in a grid layout
  So that I can explore different teachings at my own pace

  Background:
    Given I open the Buddhist quotes application
    And the application has loaded successfully

  Scenario: Quote grid displays below continuous display
    When the page loads
    Then I should see a quote grid below the continuous display section
    And the grid should occupy approximately 67% of the screen height
    And the grid should display multiple quote cards

  Scenario: Desktop responsive layout (4 columns)
    Given I am viewing the application on a desktop (1280px width)
    When the page loads
    Then the quote grid should display 4 columns
    And quotes should be evenly distributed across columns
    And each quote card should be clearly readable

  Scenario: Tablet responsive layout (2 columns)
    Given I am viewing the application on a tablet (768px width)
    When the page loads
    Then the quote grid should display 2 columns
    And quotes should be evenly distributed across columns
    And touch targets should be at least 44x44 pixels

  Scenario: Mobile responsive layout (1 column)
    Given I am viewing the application on a mobile device (375px width)
    When the page loads
    Then the quote grid should display 1 column
    And I should be able to scroll vertically to see more quotes
    And each quote card should span the full width minus margins

  Scenario: Quote cards display complete information
    When I view a quote card in the grid
    Then I should see the quote content
    And I should see the author name
    And I should see the category/type
    And the Vietnamese diacritics should render correctly

  Scenario: Grid handles varying quote lengths gracefully
    Given the grid contains quotes of different lengths
    When I view the grid
    Then all quote cards should maintain consistent card height within each row
    And longer quotes should wrap properly
    And shorter quotes should not create excessive whitespace

  Scenario: Vertical scrolling for overflow content
    Given the grid contains more quotes than fit in the viewport
    When I scroll down
    Then additional quotes should be visible
    And the continuous display section should remain at the top
    And scrolling should be smooth and responsive
