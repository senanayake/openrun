Feature: Training load model — TSS, CTL, ATL, TSB

  Scenario: Threshold 1-hour effort scores approximately 100 TSS
    Given a workout of 3600 seconds where average pace equals FTP pace
    When TSS is calculated with no elevation
    Then the TSS should be approximately 100.0 within 1 percent

  Scenario: Easy run scores less than 50 TSS per hour
    Given a workout of 3600 seconds where average pace is 20 percent slower than FTP
    When TSS is calculated with no elevation
    Then the TSS should be less than 50.0

  Scenario: CTL builds toward steady state after 42 days of consistent load
    Given 42 days of 50.0 TSS per day starting from zero fitness
    When load history is computed
    Then the final CTL should be approximately 32.0 within 5 percent

  Scenario: ATL drops after rest following a hard block
    Given 7 days of 100.0 TSS per day followed by 7 rest days
    When load history is computed
    Then the ATL on the last day should be lower than the ATL at day 7

  Scenario: Overtraining risk warning when ATL greatly exceeds CTL
    Given current CTL of 50.0 and ATL of 80.0
    When readiness is assessed
    Then an OVERTRAINING_RISK warning should be present with critical severity

  Scenario: No critical warning in race-ready TSB window
    Given current CTL of 70.0 and ATL of 55.0
    When readiness is assessed
    Then no warnings with critical severity should be present

  Scenario: Heavy training block warning at deeply negative TSB
    Given current CTL of 60.0 and ATL of 85.0
    When readiness is assessed
    Then a HEAVY_TRAINING_BLOCK warning should be present
