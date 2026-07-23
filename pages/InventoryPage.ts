import {Page,Locator,expect} from '@playwright/test';

export class InventoryPage {
    readonly page: Page;
    readonly headerTitle: Locator;
    readonly sortDropdown: Locator;
    readonly itemNames: Locator;
    readonly itemPrices: Locator;
    readonly addToCartButtons: Locator;
    readonly cartBadge: Locator;
    readonly cartLink : Locator;


    constructor(page: Page) {
        this.page = page;
        this.headerTitle = page.getByText('Products');
        this.sortDropdown = page.locator('[data-test="product-sort-container"]');
        this.itemNames = page.locator('[data-test="inventory-item-name"]');
        this.itemPrices = page.locator('[data-test="inventory-item-price"]');
        this.addToCartButtons = page.locator('button:has-text("Add to cart")');
        this.cartBadge = page.locator('.shopping_cart_badge');
        this.cartLink = page.locator('.shopping_cart_link');



    }

    async assertOnInventoryPage() {
        await this.headerTitle.waitFor({ state: 'visible' });
    }
    async selectSortOption(value: string) {
    await this.sortDropdown.selectOption(value);
    await this.itemPrices.first().waitFor({ state: 'visible' });
  }
  async verifyLowToHighSorting() {
    const priceTexts = await this.itemPrices.allTextContents();
    const prices = priceTexts.map(p => parseFloat(p.replace('$', '')));
    console.log('Prices:', prices); // Log the prices for debugging
    
    for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
    }
}

    async addChepestItemToCart() :Promise<{ cheapestItemName: string, price: string }> {
        await this.sortDropdown.selectOption('lohi'); 
        await this.itemPrices.first().waitFor({ state: 'visible' });
        const cheapestItemName = await this.itemNames.first().textContent();
        const chepestItemPrice = await this.itemPrices.first().textContent();
        await this.addToCartButtons.first().click();
        return { cheapestItemName: cheapestItemName ? cheapestItemName.trim() : '' , price: chepestItemPrice ? chepestItemPrice.trim() : '' };

}
    async varifyCartBadgeCount(expectedCount: number) {
        const badgeCount = await this.cartBadge.textContent();
        expect(badgeCount).toBe(expectedCount.toString());
    }
    async gotoCartPage() {
        await this.cartLink.click();
    }


}