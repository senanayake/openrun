Feature: Flexible periodization plan generation

  Scenario: Plan week count matches available weeks
    Given a race 175 days from today
    And current weekly mileage of 30.0 miles
    And course difficulty of moderate
    When the periodization plan is built
    Then the plan should contain exactly 25 weeks

  Scenario: Weeks are assigned to correct training phases
    Given a race 175 days from today
    And current weekly mileage of 30.0 miles
    And course difficulty of moderate
    When the periodization plan is built
    Then weeks 1 through 7 should be in the BASE phase
    And weeks 8 through 14 should be in the SUPPORT phase
    And weeks 15 through 22 should be in the SPECIFIC phase
    And weeks 23 through 25 should be in the TAPER phase

  Scenario: Every 4th non-taper week is a recovery week
    Given a race 175 days from today
    And current weekly mileage of 30.0 miles
    And course difficulty of moderate
    When the periodization plan is built
    Then week 4 should be marked as a recovery week
    And week 8 should be marked as a recovery week
    And week 12 should be marked as a recovery week

  Scenario: Last taper week has significantly reduced mileage
    Given a race 175 days from today
    And current weekly mileage of 30.0 miles
    And course difficulty of moderate
    When the periodization plan is built
    Then the last week mileage should be less than 50 percent of peak mileage

  Scenario: Insufficient weeks until race raises ValueError
    Given a race 70 days from today
    And current weekly mileage of 30.0 miles
    And course difficulty of moderate
    When the periodization plan is built
    Then a ValueError should be raised

  Scenario: Hard course includes hill work in specific phase
    Given a race 175 days from today
    And current weekly mileage of 30.0 miles
    And course difficulty of moderate-hard
    When the periodization plan is built
    Then at least one specific-phase week should include Hill repeats
