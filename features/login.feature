@Login @CriticalPath @Smoke
Feature: Salesforce Login

  Background:
    Given User navigates to the Salesforce login page
    And User is on the Salesforce login page

  @Login @CriticalPath @Smoke @Regression
  Scenario: TC-LOGIN-001 - Successful login with valid credentials using custom domain
    When User clicks the Use Custom Domain link
    Then User is navigated to the Custom Domain page
    When User enters the custom domain from environment
    And User clicks the Continue button
    Then User is navigated to the org login page
    When User enters the valid username from environment
    And User enters the valid password from environment
    And User clicks the Log In button
    Then User validates the Salesforce home page is loaded

  @Login @Regression
  Scenario: TC-LOGIN-002 - Login rejected with invalid password
    When User clicks the Use Custom Domain link
    Then User is navigated to the Custom Domain page
    When User enters the custom domain from environment
    And User clicks the Continue button
    Then User is navigated to the org login page
    When User enters the valid username from environment
    And User enters password "InvalidPassword123"
    And User clicks the Log In button
    Then User validates the login error message is displayed

  @Login @Regression
  Scenario: TC-LOGIN-003 - Login rejected with unknown username
    When User clicks the Use Custom Domain link
    Then User is navigated to the Custom Domain page
    When User enters the custom domain from environment
    And User clicks the Continue button
    Then User is navigated to the org login page
    When User enters username "invalid@test.com.poc"
    And User enters the valid password from environment
    And User clicks the Log In button
    Then User validates the login error message is displayed

  @Login @Smoke @CriticalPath
  Scenario: TC-LOGIN-004 - Quick login path with valid credentials
    Given User logs in with valid credentials
    Then User validates the Salesforce home page is loaded
