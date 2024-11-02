async function onOrderItemLookupChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var lookupField = formContext.getAttribute("erp_orderitemrefid");
    var lookupValue = lookupField.getValue();

    if (lookupValue != null && lookupValue.length > 0 && lookupValue[0].id) {
        var lookupId = lookupValue[0].id.replace("{", "").replace("}", "");
        var query = `?$filter=erp_orderitemid eq ${lookupId}`;
        var resulta = await Xrm.WebApi.retrieveMultipleRecords("erp_orderitem", query);
        
        if (resulta.entities.length > 0) {
            var ProdID = resulta.entities[0]._erp_productcode_value;
            var OrdQty = resulta.entities[0].erp_orderqty;
            
            var ProdQuery = `?$filter=erp_productmasterid eq ${ProdID}`;
            
            Xrm.WebApi.retrieveRecord("erp_productmaster", ProdID, ProdQuery).then(
                function (result) {
                    if (result && result.erp_name) {
                        var lookupValue = [{ id: result.erp_productmasterid, name: result.erp_name, entityType: 'erp_productmaster' }];
                        formContext.getAttribute("erp_productcoderefid").setValue(lookupValue);
                        formContext.getAttribute("erp_productcoderefid").setSubmitMode("always");
                        formContext.getAttribute("erp_productname").setValue(result.erp_productname);
                        formContext.getAttribute("erp_unitprice").setValue(result.erp_unitprice);
                        formContext.getAttribute("erp_discount").setValue(result.erp_maxdisc);
                        formContext.getAttribute("erp_tax").setValue(result.erp_tax);
                        formContext.getAttribute("erp_units").setValue(result.erp_units);
                        console.log("Lookup value set successfully.");
                    } else {
                        console.error("Product name not found.");
                    }
                },
                function (error) {
                    console.error("Error retrieving product name: " + error.message);
                }
            );
            formContext.getAttribute("erp_orderqty").setValue(OrdQty);
            formContext.getAttribute("erp_oaqty").setValue(OrdQty);

        } else {
            console.error("No entities found in resulta.");
        }
    } else {
        console.error("lookupValue is null or does not contain an id.");
    }
}

