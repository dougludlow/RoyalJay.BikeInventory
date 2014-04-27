using Breeze.ContextProvider;
using Breeze.ContextProvider.EF6;
using Breeze.WebApi2;
using Newtonsoft.Json.Linq;
using RoyalJay.BikeInventory.Data.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;

namespace RoyalJay.BikeInventory.Web.Controllers
{
    [BreezeController, Authorize]
    public class InventoryController : ApiController
    {
        readonly EFContextProvider<InventoryContext> provider = new EFContextProvider<InventoryContext>();

        public InventoryController()
        {
            provider.BeforeSaveEntityDelegate = (e) =>
            {
                if (e.Entity.GetType() == typeof(Bike))
                {
                    var bike = e.Entity as Bike;

                    if (e.EntityState == Breeze.ContextProvider.EntityState.Added)
                    {
                        bike.CreatedDate = DateTime.UtcNow;
                        bike.CreatedUsername = RequestContext.Principal.Identity.Name;
                    }
                    else if (e.EntityState == Breeze.ContextProvider.EntityState.Modified)
                    {
                        bike.LastModifiedDate = DateTime.UtcNow;
                        bike.LastModifiedUsername = RequestContext.Principal.Identity.Name;
                        e.ForceUpdate = true;
                    }
                }

                return true;
            };
        }

        // GET: breeze/Inventory/Metadata
        [HttpGet]
        public string Metadata()
        {
            return provider.Metadata();
        }

        // GET: breeze/Inventory/Bikes
        [HttpGet]
        public IQueryable<Bike> Bikes()
        {
            return provider.Context.Bikes;
        }

        // GET: breeze/Inventory/BikeTypes
        [HttpGet]
        public IQueryable<BikeType> BikeTypes()
        {
            return provider.Context.BikeTypes;
        }

        // GET: breeze/Inventory/BikeSizes
        [HttpGet]
        public IQueryable<BikeSize> BikeSizes()
        {
            return provider.Context.BikeSizes;
        }

        // POST: breeze/Inventory/SaveChanges
        [HttpPost]
        public SaveResult SaveChanges(JObject saveBundle)
        {
            return provider.SaveChanges(saveBundle);
        }
    }
}