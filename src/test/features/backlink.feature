Feature: backlink feature

    backlink
    Scenario: user can follow explicit backlink
        Given I am on the word-2 page
        When I click word-1
        Then I see the heading "Word 1"

    Scenario: user can follow implicit backlink
        Given I am on the word page
        When I click word-1
        Then I see the heading "Word 1"
