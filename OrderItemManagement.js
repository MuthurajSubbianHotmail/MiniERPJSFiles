//When Customer Product ID is changed, this function will check if similar prodcut id is already ordered 
//by the customer, and if so, it will fetch the latest record and fill the values in respective field.
async function onCustProductIDChange(executionContext) {
    var formContext = executionContext.getFormContext();
    var custProdId = formContext.getAttribute("erp_custitemcode").getValue();
    
    
    if (custProdId != null) {
        try {
            // Corrected query string format
            var query = `?$filter=erp_custitemcode eq '${custProdId}'&$orderby=createdon desc&$top=1`;

            //var query = `?$filter=ord_custprodid eq '${custProdId}' and ord_customer eq '${CustID}'&$orderby=createdon desc&$top=1`;

            
            var resulta = await Xrm.WebApi.retrieveMultipleRecords("erp_orderitem", query);

            if (resulta.entities.length > 0) {
                var latestProduct = resulta.entities[0];
                console.log("Latest Product:", latestProduct); // Log the latest product for debugging

                // Set text fields
                formContext.getAttribute("erp_custitemname").setValue(latestProduct.erp_custitemname);
                formContext.getAttribute("erp_custproductdesc").setValue(latestProduct.erp_custproductdesc);

                var ordQtyField = formContext.getAttribute("erp_orderqty");
                if (ordQtyField.getValue() === null || ordQtyField.getValue() === "") {
                    ordQtyField.setValue(latestProduct.erp_orderqty);
                }
                
                
                // Set lookup field
                var lookupValue = [{
                    id: latestProduct["_erp_productcode_value"], // GUID of the related record
                    name: latestProduct["_erp_productcode_value@OData.Community.Display.V1.FormattedValue"], // Name of the related record
                    entityType: "erp_productmaster" // Entity type of the related record
                }];
                formContext.getAttribute("erp_productcode").setValue(lookupValue);
                await onProductLookupChange(executionContext);
            } else {
                console.log("No products found for the given custprodid.");
            }
        } catch (error) {
            console.error("Error retrieving products:", error); // Log the entire error object
        }
    } else {
        alert("Customer Product ID is null.");
    }
}

async function onProductLookupChange(executionContext) {
    
    var formContext = executionContext.getFormContext();
    var lookupField = formContext.getAttribute("erp_productcode");
    var lookupValue = lookupField.getValue();
    
    if (lookupValue != null) {
        var lookupId = lookupValue[0].id.replace("{", "").replace("}", "");;
        
        var query = `?$filter=erp_productmasterid eq ${lookupId}`;
        var resulta = await Xrm.WebApi.retrieveMultipleRecords("erp_productmaster", query);
        
        if (resulta.entities.length > 0) {
            formContext.getAttribute("erp_productname").setValue(resulta.entities[0].erp_productname);
        }
    } 
}