Feature: backlink feature

    explicit backlink
    Scenario: user can follow backlink
        Given we are on the word-1 page
        When use clicks word-2
        Then the user sees the word-2 page
