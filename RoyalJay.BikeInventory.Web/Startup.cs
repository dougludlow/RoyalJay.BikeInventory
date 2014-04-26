using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(RoyalJay.BikeInventory.Web.Startup))]
namespace RoyalJay.BikeInventory.Web
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
