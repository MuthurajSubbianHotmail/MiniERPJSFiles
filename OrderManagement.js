async function onCustomerChange(executionContext){
    var formContext = executionContext.getFormContext();
    var custID = formContext.getAttribute("erp_customer").getValue();
    
    if (custID != null && custID.length > 0) {  // Check if custID is not null and has elements
        var CustID1 = custID[0].id.replace(/[{}]/g, '');
        try {
            var query = `?$filter=accountid eq '${CustID1}'`;
            var resulta = await Xrm.WebApi.retrieveMultipleRecords("account", query);
            
            if (resulta.entities.length > 0) {
                var selectedCust = resulta.entities[0];
                
                // Set text fields
                formContext.getAttribute("erp_deliveryadd1").setValue(selectedCust.address1_line1);
                formContext.getAttribute("erp_deliveryadd2").setValue(selectedCust.address1_line2);
                formContext.getAttribute("erp_deliveryadd3").setValue(selectedCust.address1_line3);
                formContext.getAttribute("erp_deliverycity").setValue(selectedCust.address1_city);
                formContext.getAttribute("erp_deliverystate").setValue(selectedCust.address1_stateorprovince);
                formContext.getAttribute("erp_deliverycountry").setValue(selectedCust.address1_country);
                formContext.getAttribute("erp_deliveryzip").setValue(selectedCust.address1_postalcode);
                formContext.getAttribute("erp_deliveryphone").setValue(selectedCust.address1_telephone1);
                
                
            } else {
                console.log("No Customer found for the given Customer ID.");
            }
        } catch(error) {
            console.error("Error retrieving Customer:", error); // Log the entire error object
        }
    } else {
        console.error("Customer ID is null or empty");
    }
}

function disableRejectedRows(executionContext) {
    var formContext = executionContext.getFormContext();
    var gridControl = formContext.getControl("OrdItemSubgrid"); // Replace with your subgrid name

    gridControl.getGrid().getRows().forEach(function (row) {
        var data = row.getData().getEntity();
        var isRejected = data.getAttribute("erp_isrejected").getValue();
        var isCancelled = data.getAttribute("erp_iscancelled").getValue();
        
        if (isRejected === true || isCancelled === true) {
            row.setDisabled(true); // Disable the row
        
        } else{
            row.setDisabled(false); // Disable the row
        }
    });
}



