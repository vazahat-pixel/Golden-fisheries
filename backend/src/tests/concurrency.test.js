import test from 'node:test';
import assert from 'node:assert/strict';

test('Enterprise Concurrency Suite: Race Conditions & Simultaneous Sales', async (t) => {

  await t.test('Scenario 1: Multi-User Simultaneous Sales & POS Checkout Race', async () => {
    let inventoryQty = 10; // Only 10 fish remaining

    // Atomic Checkout Simulation
    const processCheckout = async (userId, qtyRequested) => {
      // Simulate database latency
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 50));

      if (inventoryQty >= qtyRequested) {
        inventoryQty -= qtyRequested;
        return { success: true, userId, deducted: qtyRequested };
      } else {
        return { success: false, userId, error: 'INSUFFICIENT_STOCK' };
      }
    };

    // Simulate 5 simultaneous checkouts of 3 items each
    const requests = [
      processCheckout('user-1', 3),
      processCheckout('user-2', 3),
      processCheckout('user-3', 3),
      processCheckout('user-4', 3),
      processCheckout('user-5', 3)
    ];

    const results = await Promise.all(requests);

    const successfulCheckouts = results.filter(r => r.success);
    const failedCheckouts = results.filter(r => !r.success);

    // Verify stock remains positive (never negative)
    assert.ok(inventoryQty >= 0, `Inventory quantity drifted negative: ${inventoryQty}`);

    // Since initial stock was 10, maximum 3 requests of 3 items each can succeed (deducting 9)
    assert.equal(successfulCheckouts.length, 3, `Expected exactly 3 successful checkouts, got ${successfulCheckouts.length}`);
    assert.equal(failedCheckouts.length, 2, `Expected exactly 2 failed checkouts, got ${failedCheckouts.length}`);
    assert.equal(inventoryQty, 1, 'Final stock level should be exactly 1');
  });

  await t.test('Scenario 2: Optimistic UI Sync Stale State Prevention', async () => {
    let activePosVersion = 1;
    let localBrowserSessionVersion = 1;

    // Simulate update event
    const handleIncomingSync = (serverVersion) => {
      if (serverVersion > localBrowserSessionVersion) {
        localBrowserSessionVersion = serverVersion;
        return 'RELOAD_REQUIRED';
      }
      return 'OK';
    };

    // When server pushes updates (advancing version to 2)
    activePosVersion = 2;

    const actionResult = handleIncomingSync(activePosVersion);
    assert.equal(actionResult, 'RELOAD_REQUIRED');
    assert.equal(localBrowserSessionVersion, 2);
  });
});
