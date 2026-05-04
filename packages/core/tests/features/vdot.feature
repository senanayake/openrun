Feature: VDOT calculation and training pace generation

  Background:
    Given the Daniels-Gilbert 1979 VO2max formula is in use

  Scenario: Calculate VDOT from a 5K race performance
    Given a runner completes 5.0 kilometres in 1200 seconds
    When VDOT is calculated
    Then the VDOT result should be approximately 49.8 within 2 percent

  Scenario: Calculate VDOT from a marathon performance
    Given a runner completes 42.195 kilometres in 12600 seconds
    When VDOT is calculated
    Then the VDOT result should be approximately 44.5 within 2 percent

  Scenario: Generate training paces for VDOT 50
    Given an athlete has VDOT 50.0
    When training paces are generated
    Then the easy pace should be slower than marathon pace
    And the marathon pace should be slower than threshold pace
    And the threshold pace should be slower than interval pace
    And the interval pace should be slower than repetition pace

  Scenario: Predict marathon time for VDOT 45
    Given an athlete has VDOT 45.0
    When marathon finish time is predicted for 42.195 kilometres
    Then the predicted time should be within 5 percent of 12444 seconds

  Scenario: Reject zero distance race input
    Given a runner completes 0.0 kilometres in 3600 seconds
    When VDOT is calculated
    Then an InvalidRaceInputError should be raised

  Scenario: Reject VDOT below minimum for pace generation
    Given an athlete has VDOT 10.0
    When training paces are generated
    Then an InvalidVDOTError should be raised
