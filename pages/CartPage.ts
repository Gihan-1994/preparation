import {Page, Locator , expect} from '@playwright/test';

export class CartPage{
    readonly page : Page;
    readonly cartItemName : Locator;

    constructor(page: Page){
        this.page = page;
        this.cartItemName = page.locator('[data-test="inventory-item-name"]');
    }
    async assertOnCartPage(){
        await this.page.waitForURL(/cart.html/);
    }
}