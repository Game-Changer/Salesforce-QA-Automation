export class HomePageLocator {
    // Static locator holder — not meant to be instantiated
    private constructor() {}

    //App Launcher waffle icon locator (only visible after successful login)
    static readonly appLauncherIcon = "//div[@class='slds-icon-waffle']";

    //Global search button locator
    static readonly globalSearchButton = "//button[contains(@aria-label,'Search')]";

}
