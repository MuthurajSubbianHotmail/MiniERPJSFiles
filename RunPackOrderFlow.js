function RunPackOrderFlow(formContext){
   // var oaID = formContext.data.entity.getId.replace(/[{}]/g, '');

    var OrdID = formContext.getAttribute("erp_name") ? formContext.getAttribute("erp_name").getValue() : null;
    var oaID = formContext.data.entity.getId().replace(/[{}]/g, '');
    console.log(oaID);


    if (formContext.getAttribute("erp_custorder") && formContext.getAttribute("erp_custorder").getValue() !== null) {
        var CustOrdID = formContext.getAttribute("erp_custorder").getValue();
        CustOrdId = CustOrdID[0].id.replace(/[{}]/g, '');
    } else {
        console.error("Customer Order ID is null or undefined.");
    }

    // var CustOrdID = formContext.getAttribute("erp_custorder") ? formContext.getAttribute("erp_custorder").getId() : null;
    // var CustOrdId = CustOrdID.replace(/[{}]/g, '');
    console.log("Customer ID:" + CustOrdId);
    //Get the Current User Name
    var UserName = Xrm.Page.context.getUserName();
    console.log(UserName);

    //Header Required to run the flow
    var MyHeaders = new Headers();
    MyHeaders.append("Content-Type", "application/json");

    //Retrive the Current Power App User Name and Current OAID
    var raw = JSON.stringify({"OrderAckId":oaID, "CustordID":CustOrdId});
    console.log(raw);

    var requestOptions = {
        method: 'POST',
        headers: MyHeaders,
        body: raw
    };
    console.log(requestOptions);
    
    //Retrieve the Environment variable to get the Flow URL
    

    Xrm.WebApi.retrieveMultipleRecords("environmentvariabledefinition", "?$select=defaultvalue&$filter=schemaname eq 'erp_MyFlowURL'").then(
        function success(results){
            console.log(results);
            for (var i = 0; i < results.entities.length; i++){
                var result = results.entities[i];
                // Columns
                var flowURL = result["defaultvalue"]; //URL
                console.log("This is Flow URL", flowURL);
                //Run the Power automate flow.  This URL comes from copying the Trigger in the Flow Action - whey a http request is received
                fetch(flowURL, requestOptions)
                .then(response=> response.text())
                .then(result => console.log(result))
                .catch(error=>console.log('error', error))
            }
            // perform operations on record retrieval
        },
        function (error){
            console.log(error.message);
        }
    );

    var alertStrings = {confirmButtonLabel: "OK", text: "Your flow is running, and you will receive an message when it is completed", title: "Flow Running"};
    var alertOptions = {height: 120, width: 260};
    Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
        function (success){
            console.log("Alert Dialogue Closed");
        },
        function(error){
            console.log(error.message);
        }
    );
}