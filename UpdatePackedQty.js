function updatePackedQtyAndDate(primaryControl, selectedControl) {
    var formContext = primaryControl;
    var subGridControl = selectedControl;
    var selectedItems = subGridControl.getGrid().getSelectedRows();
    
    selectedItems.forEach(function (row) {
        var entity = row.getData().getEntity();
        var packOrdQty = entity.attributes.getByName("erp_packordqty").getValue();
        var packedQty = entity.attributes.getByName("erp_packedqty").getValue();
        console.log("PackOrdQty: " + packOrdQty + " PackedQty: " + packedQty);

        if (packOrdQty !== packedQty) {
            try {
                // Update PackedQty and Packed On fields
                entity.attributes.getByName("erp_packedqty").setValue(packOrdQty);
                entity.attributes.getByName("erp_packedon").setValue(new Date());

                // Save changes
                entity.save();
            } catch (e) {
                console.error("Error updating record: ", e);
            }
        } else {
            console.log("Skipping row where PackOrdQty equals PackedQty");
        }
    });

    // Refresh the subgrid
    subGridControl.refresh();
}
