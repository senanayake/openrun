Feature: Course-adjusted race time prediction

  Scenario: Load Twin Cities Marathon course data
    When the tcm-2026 race is loaded
    Then the race name should contain Twin Cities
    And the course type should be point_to_point
    And the elevation adjustment factor should be 1.012

  Scenario: Course-adjusted time exceeds flat prediction for TCM
    Given an athlete with VDOT 45.0
    And the tcm-2026 course data is loaded
    When the course-adjusted finish time is predicted
    Then the course-adjusted time should be greater than the flat prediction

  Scenario: Hard segment pace is slower than easy segment pace in pace bands
    Given an athlete with VDOT 50.0
    And the tcm-2026 course data is loaded
    When pace bands are generated for all segments
    Then the hard-difficulty segment pace should be slower than any easy-difficulty segment pace

  Scenario: Summit Avenue segment flagged as critical
    Given the tcm-2026 course data is loaded
    When critical segments are identified
    Then a segment containing Summit should be in the list

  Scenario: Minnehaha trap segment flagged as critical
    Given the tcm-2026 course data is loaded
    When critical segments are identified
    Then a segment containing Minnehaha should be in the list
