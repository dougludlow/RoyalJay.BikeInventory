(function (inventory, window, ko, breeze, $, undefined) {
    'use strict';

    inventory.init = function () {

        inventory.vm = new InventoryViewModel();
        ko.applyBindings(inventory.vm);
    };

    function InventoryViewModel() {
        var self = this;

        this.bike = ko.observable();
        this.bikes = ko.observable([]);
        this.editing = ko.observable(false);
    }

})(window.inventory = window.inventory || {}, window, window.ko, window.breeze, window.jQuery);

window.inventory.init();