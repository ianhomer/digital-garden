Feature: link feature

    explicit link
    Scenario: user can follow link
        Given I am on the word-1 page
        When I click word-2
        Then I see the heading "Word 2"
