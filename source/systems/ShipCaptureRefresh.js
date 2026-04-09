// Simple fix for ship capture inventory refresh
// This file adds a method to refresh port menus when ships are captured

export function refreshPortMenusAfterCapture(scene) {
    if (scene && scene.ports) {
        scene.ports.forEach(port => {
            if (port.menuActive && port.currentMenu === 'shipInventory') {
                console.log('Refreshing ship inventory menu after capture');
                port.hideMenu();
                setTimeout(() => {
                    port.showShipInventory();
                }, 100);
            }
        });
    }
}
