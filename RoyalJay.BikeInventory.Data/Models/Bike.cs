﻿using System;
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

        [Required, MaxLength(50)]
        public string Code { get; set; }

        [Required, MaxLength(255)]
        public string Description { get; set; }

        [Required, MaxLength(50)]
        public string Brand { get; set; }

        [Required, MaxLength(50)]
        public string Model { get; set; }

        [Display(Name = "Size")]
        public int SizeId { get; set; }

        [Required, MaxLength(50)]
        public string Color { get; set; }

        [Display(Name = "Type")]
        public int TypeId { get; set; }

        //[DataType(DataType.Currency)]
        public double Price { get; set; }
        public int Quantity { get; set; }

        [Display(Name = "In Storage?")]
        public bool InStorage { get; set; }

        [Display(Name = "Created")]
        public DateTime CreatedDate { get; set; }

        [Display(Name = "Created By")]
        public string CreatedUsername { get; set; }

        [Display(Name = "Last Modified")]
        public DateTime? LastModifiedDate { get; set; }

        [Display(Name = "Last Modified By")]
        public string LastModifiedUsername { get; set; }

        public virtual BikeSize Size { get; set; }
        public virtual BikeType Type { get; set; }
    }
}
