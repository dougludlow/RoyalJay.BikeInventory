using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoyalJay.BikeInventory.Data.Models
{
    public class InventoryContext : DbContext
    {
        public InventoryContext()
            : base("name=InventoryContext")
        {
            Database.SetInitializer(new InventoryInitializer());
        }

        public DbSet<Bike> Bikes { get; set; }
        public DbSet<BikeType> BikeTypes { get; set; }
    }

    public class InventoryInitializer : DropCreateDatabaseIfModelChanges<InventoryContext> 
    {
        protected override void Seed(InventoryContext context)
        {
            context.BikeTypes.AddRange( new List<BikeType> {
                new BikeType { Name = "Road" },
                new BikeType { Name = "Mountain" },
                new BikeType { Name = "BMX" },
                new BikeType { Name = "Touring" },
                new BikeType { Name = "Hybrid" },
                new BikeType { Name = "Racing" }
            });
        }
    }
}
