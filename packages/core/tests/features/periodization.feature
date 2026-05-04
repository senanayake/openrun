Feature: 22-week periodization plan generation

  Scenario: Plan has exactly 22 weeks
    Given a race 175 days from today
    And current weekly mileage of 30.0 miles
    And course difficulty of moderate
    When the periodization plan is built
    Then the plan should contain exactly 22 weeks

  Scenario: Weeks are assigned to correct training phases
    Given a race 175 days from today
    And current weekly mileage of 30.0 miles
    And course difficulty of moderate
    When the periodization plan is built
    Then weeks 1 through 6 should be in the BASE phase
    And weeks 7 through 12 should be in the SUPPORT phase
    And weeks 13 through 19 should be in the SPECIFIC phase
    And weeks 20 through 22 should be in the TAPER phase

  Scenario: Every 4th non-taper week is a recovery week
    Given a race 175 days from today
    And current weekly mileage of 30.0 miles
    And course difficulty of moderate
    When the periodization plan is built
    Then week 4 should be marked as a recovery week
    And week 8 should be marked as a recovery week
    And week 12 should be marked as a recovery week

  Scenario: Taper weeks have significantly reduced mileage
    Given a race 175 days from today
    And current weekly mileage of 30.0 miles
    And course difficulty of moderate
    When the periodization plan is built
    Then week 22 mileage should be less than 50 percent of peak mileage

  Scenario: Insufficient weeks until race raises ValueError
    Given a race 120 days from today
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
