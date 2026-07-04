export class LoginPageLocator{
    // Static locator holder — not meant to be instantiated
    private constructor() {}

    //Use custom domain link locator
    static readonly useCustomDomainLink = "//a[text()='Use Custom Domain']";

    // CUSTOM DOMAIN PAGE LOCATORS
    //Custom Domain input field locator
    static readonly customDomainInputField = "//label[text()='Custom Domain']/..//input";

    //continue button locator
    static readonly continueButton = "//button[text()='Continue']";

    //CREDENTIALS PAGE LOCATORS
    //Username input field locator
    static readonly usernameInputField = "//input[@id='username']";

    //Password input field locator
    static readonly passwordInputField = "//input[@id='password']";

    //Login button locator
    static readonly loginButton = "//input[@id='Login']";

    //Error message locator (shown on the login page after a failed login attempt)
    static readonly errorMessage = 'div#error.loginError';



}