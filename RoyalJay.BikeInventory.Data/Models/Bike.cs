using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RoyalJay.BikeInventory.Data.Models
{
    public class Bike
    {
        [Key]
        public int Id { get; set; }

        public string Code { get; set; }

        public string Name { get; set; }
        public string Description { get; set; }
        public string Brand { get; set; }
        public string Model { get; set; }
        public string Color { get; set; }

        public int TypeId { get; set; }

        public double Price { get; set; }
        public int Quantity { get; set; }

        public bool InStorage { get; set; }

        public virtual BikeType Type { get; set; }
    }
}
