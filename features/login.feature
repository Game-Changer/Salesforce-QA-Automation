@Login @CriticalPath @Smoke
Feature: Salesforce Login

  Background:
    Given User navigates to Salesforce login page

  @Login @CriticalPath @Smoke @Regression
  Scenario: Successful login with valid credentials using custom domain
    When User selects custom domain option
    And User enters custom domain from environment
    And User clicks continue
    And User enters valid username from environment
    And User enters valid password from environment
    And User clicks login button
    Then Login should be successful

  @Login @Regression
  Scenario: Login failure with invalid password
    When User selects custom domain option
    And User enters custom domain from environment
    And User clicks continue
    And User enters valid username from environment
    And User enters password "InvalidPassword123"
    And User clicks login button
    Then Error message should be displayed

  @Login @Regression
  Scenario: Login failure with invalid username
    When User selects custom domain option
    And User enters custom domain from environment
    And User clicks continue
    And User enters username "invalid@test.com.poc"
    And User enters valid password from environment
    And User clicks login button
    Then Error message should be displayed

  @Login @Smoke @CriticalPath
  Scenario: Quick login with valid credentials
    Given User logs in with valid credentials
    Then Login should be successful
