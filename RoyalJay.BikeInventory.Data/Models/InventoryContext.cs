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
        public DbSet<BikeSize> BikeSizes { get; set; }
    }

    public class InventoryInitializer : DropCreateDatabaseIfModelChanges<InventoryContext> 
    {
        protected override void Seed(InventoryContext context)
        {
            context.BikeTypes.AddRange( new List<BikeType> {
                new BikeType { Description = "Road" },
                new BikeType { Description = "Mountain" },
                new BikeType { Description = "BMX" },
                new BikeType { Description = "Touring" },
                new BikeType { Description = "Hybrid" },
                new BikeType { Description = "Racing" }
            });

            context.BikeSizes.AddRange(new List<BikeSize> {
                new BikeSize { Description = "XS" },
                new BikeSize { Description = "S" },
                new BikeSize { Description = "M" },
                new BikeSize { Description = "L" },
                new BikeSize { Description = "XL" },
            });
        }
    }
}
