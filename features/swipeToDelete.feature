Feature: Swipe an editable row to the left reveals the delete button

Scenario: Delete A Row By Swiping
        Given Initial Screen
        When I wait to see "Tab 1"
        Then I should see text containing "I am row 2"
        ##ios
        When I swipe row with label "I am row 2" to the left
        #android (not working)
        #When I drag from 100:300 to 10:300 moving with 10 steps
        Then I wait to see "löschen"
        ##ios
        And take screenshot
        #android
        #And I take a screenshot
        When I press "löschen"
        #ios
        And I wait to not see "löschen"
        #android
        #And I don't see "löschen"
        When I press "OK"
        Then I should not see text containing "I am row 2"
        Then I should see text containing "I am row 1"
        Then I should see text containing "I am row 3"
