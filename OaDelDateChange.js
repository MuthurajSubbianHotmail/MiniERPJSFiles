async function OnOADelDateChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var delDateField = formContext.getAttribute("erp_oadeldate");
    var delDateValue = delDateField.getValue();
    console.log(delDateValue);

    var oaID = formContext.data.entity.getId().replace(/[{}]/g, '');
    console.log(oaID);

    if (delDateValue != null) {
        var query = `?$filter=_erp_orderackrefid_value eq ${oaID}`;
        var resulta = await Xrm.WebApi.retrieveMultipleRecords("erp_ordackitem", query);

        for (var i = 0; i < resulta.entities.length; i++) {
            var entity = resulta.entities[i];
            
            // Check if erp_deldate is null before updating
            if (entity["erp_deldate"] == null) {
                entity["erp_deldate"] = delDateValue; // Update only if erp_deldate is null
                await Xrm.WebApi.updateRecord("erp_ordackitem", entity.erp_ordackitemid, {
                    "erp_deldate": delDateValue,
                    "@odata.type": "Microsoft.Dynamics.CRM.erp_ordackitem"
                });
            }
        }

        console.log("Delivery date updated in all related Order Acknowledgment Items where it was null.");
    }
}
