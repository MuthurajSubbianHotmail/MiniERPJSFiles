async function triggerOrderFlow(primaryControl) {
    var formContext = primaryControl;
    var recordId = formContext.data.entity.getId();
   // var recordName = formContext.data.entity.getValue();
    alert(recordName);

    var request = {
        entityReference: { entityType: "orders", id: recordId }, // Replace 'orders' with the actual entity logical name
        getMetadata: function () {
            return {
                boundParameter: "entityReference",
                parameterTypes: {
                    "entityReference": {
                        typeName: "Microsoft.Dynamics.CRM.crmbaseentity",
                        structuralProperty: 5
                    },
                    "OrderNo": {
                        typeName: "Edm.String",
                        structuralProperty: 1
                    }
                },
                operationType: 2,
                operationName: "Print Order Confirmation" // Replace 'YourFlowName' with the actual name of the flow
            };
        }
    };

    Xrm.WebApi.online.execute(request).then(
        function success(response) {
            if (response.ok) {
                console.log("Flow successfully triggered.");
            }
        },
        function (error) {
            console.log("Error triggering flow: " + error.message);
        }
    );
}