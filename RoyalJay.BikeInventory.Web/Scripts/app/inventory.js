(function (inventory, window, ko, breeze, $, undefined) {
    'use strict';

    inventory.init = function () {
        var $modal = $('.bike-modal');

        ko.validation.configure({
            insertMessages: false,
            errorClass: 'has-error',
            decorateElement: true
        });

        inventory.vm = new InventoryViewModel();
        inventory.vm.init();
        ko.applyBindings(inventory.vm);

        $modal.on('hidden.bs.modal', function (e) {
            inventory.vm.manager.rejectChanges();
            inventory.vm.editing(false);
        });

        $(document).on('click', '.btn.details', function () {
            var bike = ko.dataFor(this);
            inventory.vm.viewBike(bike);
            $modal.modal();
        });

        $(document).on('click', '.btn.delete', function () {
            var bike = ko.dataFor(this);
            if (confirm('Are you sure you want to remove the ' + bike.Description() + ' from the inventory?'))
                inventory.vm.deleteBike(bike);
        });

        $(document).on('click', '.btn.edit', function () {
            inventory.vm.editing(true);
        });

        $(document).on('click', '.btn.add', function () {
            inventory.vm.createBike();
            $modal.modal();
        });

        $(document).on('click', '.btn.save', function () {
            var saved = inventory.vm.saveBike(function () {
                $modal.modal('hide');
            });
        });

        $(document).on('click', '.btn.prev', function () {
            inventory.vm.bikesPage(inventory.vm.bikesPage() - 1);
        });

        $(document).on('click', '.btn.next', function () {
            inventory.vm.bikesPage(inventory.vm.bikesPage() + 1);
        });

        $('.btn.search').on('click', function () {
            if (inventory.vm.searchText())
                inventory.vm.refreshBikes();
        });

        $('.btn.refresh').on('click', function () {
            inventory.vm.fetchBikes(inventory.vm.bikesQuery());
        });
    };

    function InventoryViewModel() {
        var self = this;

        this.manager = new breeze.EntityManager('breeze/inventory');

        this.bike = ko.observable();
        this.bikes = ko.observableArray([]);
        this.bikesPage = ko.observable(0);
        this.bikesTotal = ko.observable(0);
        this.pageSize = ko.observable(2);
        this.types = ko.observableArray([]);
        this.sizes = ko.observableArray([]);
        this.searchText = ko.observable('');
        this.editing = ko.observable(false);
        this.loaded = ko.observable(false);
        this.fatal = ko.observable(false);

        this.bikeCount = ko.computed(function () {
            return self.bikes().length;
        });

        this.bikeCount.subscribe(function (count) {
            if (count === 0 && self.bikesTotal() > 0)
                self.refreshBikes();
        });

        this.searchText.subscribe(function (searchText) {
            if (searchText.length === 1 && self.bikesPage() !== 0)
                self.bikesPage(0)
        });

        this.bikesQuery = ko.computed(function () {
            var searchText = self.searchText().trim(),
                query = breeze.EntityQuery.from('Bikes')
                .expand('Type')
                .skip(self.bikesPage() * self.pageSize())
                .take(self.pageSize())
                .orderByDesc('CreatedDate')
                .inlineCount(true)
                .using(self.manager);

            if (searchText) {
                var code = breeze.Predicate.create('Code', 'substringof', searchText),
                    desc = breeze.Predicate.create('Description', 'substringof', searchText),
                    brand = breeze.Predicate.create('Brand', 'substringof', searchText),
                    model = breeze.Predicate.create('Model', 'substringof', searchText),
                    color = breeze.Predicate.create('Color', 'substringof', searchText),
                    type = breeze.Predicate.create('Type.Description', 'substringof', searchText),
                    size = breeze.Predicate.create('Size.Description', 'substringof', searchText),
                    predicate = breeze.Predicate.or([code, desc, brand, model, color, type, size]);

                query = query.where(predicate);
            }

            return query;
        });//.extend({ rateLimit: { timeout: 250, method: "notifyWhenChangesStop" } });

        this.fetchBikes = function (query) {
            self.loaded(false);
            query.execute()
                .then(function (data) {
                    self.bikesTotal(data.inlineCount)
                    self.bikes(data.results);
                    self.loaded(true);
                })
                .fail(fatalError)
                .catch(fatalError);
        };

        this.refreshBikes = function() {
            inventory.vm.fetchBikes(inventory.vm.bikesQuery());
        };

        this.init = function () {
            self.manager.fetchMetadata().then(function () {

                self.manager.metadataStore.registerEntityTypeCtor('Bike', null, function (bike) {
                    inventory.helpers.addValidationRules(bike);
                    bike.Price = bike.Price.extend({ numeric: 2 });
                });

                self.bikesQuery.subscribe(self.fetchBikes);
                self.bikesQuery.notifySubscribers(self.bikesQuery());

                breeze.EntityQuery.from('BikeTypes')
                    .using(self.manager)
                    .execute()
                    .then(function (data) {
                        self.types(data.results);
                    })
                    .fail(fatalError)
                    .catch(fatalError);

                breeze.EntityQuery.from('BikeSizes')
                    .using(self.manager)
                    .execute()
                    .then(function (data) {
                        self.sizes(data.results);
                    })
                    .fail(fatalError)
                    .catch(fatalError);
            })
            .catch(fatalError);

            this.createBike = function () {
                var store = self.manager.metadataStore,
                    bikeType = store.getEntityType('Bike'),
                    bike = bikeType.createEntity();

                self.editBike(bike);
                
            };

            this.editBike = function (bike) {
                self.bike(bike);
                ko.validation.group(self.bike()).showAllMessages(false);
                self.editing(true);
            };

            this.viewBike = function(bike) {
                self.editing(false);
                self.bike(bike);
            };

            this.saveBike = function (success, fail) {
                var bike = self.bike(),
                    state = bike.entityAspect.entityState,
                    errors = ko.validation.group(self.bike());

                if (errors().length === 0) {

                    if (state.isDetached()) {
                        self.manager.addEntity(bike);
                        state = bike.entityAspect.entityState
                    }

                    if (state.isAdded() || state.isModified()) {
                        self.manager.saveChanges()
                            .then(function (data) {
                                if (state.isAdded()) {
                                    self.bikes.unshift(bike);
                                    self.bikesTotal(self.bikesTotal() + 1);
                                }

                                typeof success === 'function' && success();
                            })
                            .fail(function (error) {
                                typeof fail === 'function' && fail();
                                console.log(error);
                            })
                            .catch(fatalError);
                    }
                    else {
                        typeof success === 'function' && success();
                    }
                }
                else 
                    errors.showAllMessages();
            };

            this.deleteBike = function (bike) {
                bike.entityAspect.setDeleted();
                self.manager.saveChanges()
                    .then(function (data) {
                        self.bikes.remove(bike);
                        self.bikesTotal(self.bikesTotal() - 1);
                    })
                    .fail(function (error) {
                        console.log(error);
                    })
                    .catch(fatalError);
            };

            this.afterAddBike = function (element, index, bike) {
                if (element.nodeType === 1)
                    $(element).removeClass('bike-hidden');
            };

            this.beforeRemoveBike = function (element, index, bike) {
                var $element = $(element);
                if (element.nodeType === 1) {
                    $element.addClass('bike-hidden');

                    if (self.loaded())
                        setTimeout(function () {
                            $element.remove();
                        }, 350);
                    else
                        $element.remove();
                }
                else
                    $element.remove();
            };
        };

        function fatalError(error) {
            console.log(error);
            self.fatal(true);
            self.loaded(true);
        }
    }

    function pad(number) {
        if (number < 10)
            return '0' + number;
        return number;
    }

    Date.prototype.toShortDateTimeString = function () {
        var month = pad(this.getMonth() + 1),
            day = pad(this.getDate()),
            year = this.getFullYear(),
            h = this.getHours() % 12,
            hours = pad(h === 0 ? 12 : h),
            minutes = pad(this.getMinutes()),
            period = hours > 11 ? 'AM' : 'PM';

        return month + '/' + day + '/' + year + ' ' + hours + ':' + minutes + ' ' + period;
    };

    ko.extenders.numeric = function (target, precision) {
        //create a writeable computed observable to intercept writes to our observable
        var result = ko.computed({
            read: target,  //always return the original observables value
            write: function (newValue) {
                var current = target(),
                    roundingMultiplier = Math.pow(10, precision),
                    newValueAsNum = isNaN(newValue) ? 0 : parseFloat(+newValue),
                    valueToWrite = Math.round(newValueAsNum * roundingMultiplier) / roundingMultiplier;

                //only write if it changed
                if (valueToWrite !== current) {
                    target(valueToWrite);
                } else {
                    //if the rounded value is the same, but a different value was written, force a notification for the current field
                    if (newValue !== current) {
                        target.notifySubscribers(valueToWrite);
                    }
                }
            }
        }).extend({ notify: 'always' });

        //initialize with current value to make sure it is rounded appropriately
        result(target());

        //return the new computed observable
        return result;
    };

    inventory.helpers = (function () {
        var foreignKeyInvalidValue = 0;

        function addValidationRules(entity) {
            var entityType = entity.entityType,
                i,
                property,
                propertyName,
                propertyObject,
                validators,
                u,
                validator,
                nValidator;

            if (entityType) {
                for (i = 0; i < entityType.dataProperties.length; i += 1) {
                    property = entityType.dataProperties[i];
                    propertyName = property.name;
                    propertyObject = entity[propertyName];
                    validators = [];

                    for (u = 0; u < property.validators.length; u += 1) {
                        validator = property.validators[u];
                        nValidator = {
                            propertyName: propertyName,
                            validator: function (val) {
                                var error = this.innerValidator.validate(val, { displayName: this.propertyName });
                                this.message = error ? error.errorMessage : "";
                                return error === null;
                            },
                            message: "",
                            innerValidator: validator
                        };
                        validators.push(nValidator);
                    }
                    propertyObject.extend({
                        validation: validators
                    });
                }

                for (i = 0; i < entityType.foreignKeyProperties.length; i += 1) {
                    property = entityType.foreignKeyProperties[i];
                    propertyName = property.name;
                    propertyObject = entity[propertyName];

                    validators = [];
                    for (u = 0; u < property.validators.length; u += 1) {
                        validator = property.validators[u];
                        nValidator = {
                            propertyName: propertyName,
                            validator: function (val) {
                                var error = this.innerValidator.validate(val, { displayName: this.propertyName });
                                this.message = error ? error.errorMessage : "";
                                return error === null;
                            },
                            message: "",
                            innerValidator: validator
                        };
                        validators.push(nValidator);
                    }
                    propertyObject.extend({
                        validation: validators
                    });
                    if (!property.isNullable) {
                        //Bussiness Rule: 0 is not allowed for required foreign keys
                        propertyObject.extend({ notEqual: foreignKeyInvalidValue });
                    }
                }
            }
        }

        return {
            addValidationRules: addValidationRules
        };
    })();

})(window.inventory = window.inventory || {}, window, window.ko, window.breeze, window.jQuery);

window.inventory.init();