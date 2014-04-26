(function (inventory, window, ko, breeze, $, undefined) {
    'use strict';

    inventory.init = function () {

        var $modal = $('.bike-modal');

        ko.validation.init({
            insertMessages: false
        });

        inventory.vm = new InventoryViewModel();
        inventory.vm.init();
        ko.applyBindings(inventory.vm);

        $(document).on('click', '.btn.create', function () {
            inventory.vm.createBike();
            $modal.modal();
        });

        $(document).on('click', '.btn.save', function () {
            var saved = inventory.vm.saveBike(function () {
                $modal.modal('hide');
            });
        });

        $(document).on('click', '.btn.details', function () {
            var bike = ko.dataFor(this);
            inventory.vm.viewBike(bike);
            $modal.modal();
        });
    };

    function InventoryViewModel() {
        var self = this;

        this.manager = new breeze.EntityManager('breeze/inventory');

        this.bike = ko.observable();
        this.bikes = ko.observableArray([]);
        this.types = ko.observableArray([]);
        this.editing = ko.observable(false);
        this.loaded = ko.observable(false);
        this.fatal = ko.observable(false);


        this.init = function () {
            self.manager.fetchMetadata().then(function () {

                self.manager.metadataStore.registerEntityTypeCtor('Bike', null, function (bike) {
                    inventory.helpers.addValidationRules(bike);
                });

                breeze.EntityQuery.from('Bikes')
                    .expand('Type')
                    .using(self.manager)
                    .execute()
                    .then(function (data) {
                        self.bikes(data.results);
                        self.loaded(true);
                    })
                    .fail(fatalError)
                    .catch(fatalError);

                breeze.EntityQuery.from('BikeTypes')
                    .using(self.manager)
                    .execute()
                    .then(function (data) {
                        self.types(data.results);
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
                                self.bikes.push(bike);
                                typeof success === 'function' && success();
                            })
                            .fail(function (error) {
                                typeof fail === 'function' && fail();
                                console.log(error);
                            })
                            .catch(fatalError);
                    }
                }
                else 
                    errors.showAllMessages();
            };
        };

        function fatalError(error) {
            console.log(error);
            self.fatal(true);
            self.loaded(true);
        }
    }

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