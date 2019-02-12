using System;
using System.Runtime.InteropServices;
using kCura.EventHandler;
using kCura.EventHandler.CustomAttributes;
using kCura.Relativity.Client;
using Relativity.API;
using Relativity.Services.Objects;

namespace MachOneShim
{
    [kCura.EventHandler.CustomAttributes.Description("MachOne Page Interaction Event Handler")]
    [System.Runtime.InteropServices.Guid("fa6dcfa3-6507-4198-9c34-911f4da28aba")]
    public class PageInteractionEventhandler : kCura.EventHandler.PageInteractionEventHandler
    {
        public override Response PopulateScriptBlocks()
        {

            // Create a response object with default values
            kCura.EventHandler.Response retVal = new Response
            {
                Success = true,
                Message = string.Empty
            };

            int currentWorkspaceArtifactID = Helper.GetActiveCaseID();

            this.RegisterLinkedClientScript("https://cdn.rawgit.com/harvesthq/chosen/gh-pages/chosen.jquery.min.js");
            //this.RegisterClientScriptBlock(new ScriptBlock() { Key = "chosenJs", Script = $"<script type=\"text/javascript\">\n {javascripts.chosen_jquery_min} \n</script>" });
            this.RegisterLinkedCss("https://cdn.rawgit.com/harvesthq/chosen/gh-pages/chosen.min.css");

            // js file compiled into string
            string htmlScript = $"<script type=\"text/javascript\">\n {javascripts.htmlscript} \n</script>";
            this.RegisterStartupScriptBlock(new kCura.EventHandler.ScriptBlock() { Key = "hackyPieh", Script = htmlScript });

            //this.RegisterStartupScriptBlock(new ScriptBlock() {
            //    Key = "startChosen",
            //    Script = @"<script type='text/javascript'> $(document).ready(function() { console.log('hello chosen'); $('.chosen-select').chosen(); }); </script>" });

            return retVal;
        }
    }
}