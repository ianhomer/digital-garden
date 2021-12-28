Feature: backlink feature

    explicit backlink
    Scenario: user can follow backlink
        Given I am on the word-1 page
        When I click word-2
        Then I see the word-2 page
