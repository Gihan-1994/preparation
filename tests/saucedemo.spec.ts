import { test , expect } from '@playwright/test';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

test.describe('Inventory Page', () => {
  // All tests in this describe block will be authenticated.
  
  test('should display the inventory page correctly', async ({ page }) => {
      const inventoryPage = new InventoryPage(page);
      // The test now starts on the inventory page, no login needed.
      await page.goto('/inventory.html');
      await inventoryPage.assertOnInventoryPage();
      await expect(inventoryPage.page).toHaveURL(/inventory.html/);

      // Action: Sort items from Z to A
      await inventoryPage.selectSortOption('lohi');

      // Assertion: Verify the sort order is correct
     // Verify prices are in ascending order
    await inventoryPage.verifyLowToHighSorting();

    const cheapestItemName = await inventoryPage.addChepestItemToCart();
    console.log('Cheapest item added to cart:', cheapestItemName);
    expect(cheapestItemName).not.toBeNull();

    await inventoryPage.varifyCartBadgeCount(1);
    
    await inventoryPage.gotoCartPage();
    expect(page.url()).toContain('/cart.html');

    //Cart Page Assertions
    const cartPage = new CartPage(page);
    await cartPage.assertOnCartPage();
    expect (cartPage.page).toHaveURL(/cart.html/);
    expect (cartPage.cartItemName).toHaveText(cheapestItemName.cheapestItemName);

    
  });
});