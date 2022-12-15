Feature: duplicate names

  Scenario: garden 1 README is rendered
    Given I am on the index page
    Then I see the heading "Garden 1 README"

  Scenario: garden 2 README is rendered
    Given I am on the readme+rqyqis page
    Then I see the heading "Garden 2 README"
