using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;

namespace RoyalJay.BikeInventory.Data.Models
{
    public class BikeSize
    {
        [Key]
        public int Id { get; set; }

        [Required, MaxLength(50)]
        public string Description { get; set; }
    }
}
