sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox"
], (Controller, MessageBox) => {
    "use strict";

    return Controller.extend("manageproduct.controller.List", {

        onInit: function () {
            this.getOwnerComponent().getModel("ui").setProperty("/editEnabled", false);
        },

        onSelectionChange: function (oEvent) {
            const mParams = oEvent.getParameters();
            const bSelected = mParams.selected;
            const aSelectedItems = mParams.listItems;
            oEvent.getSource().getSelectedItems().length > 0 ?
                this.getOwnerComponent().getModel("ui").setProperty("/editEnabled", true) :
                this.getOwnerComponent().getModel("ui").setProperty("/editEnabled", false);

            aSelectedItems.forEach(item => {
                item.getCells().forEach(cell => {
                    if (cell.getBindingInfo("value") && cell.getBindingInfo("value").binding.getPath() === "Rating") {
                        cell.setEnabled(bSelected);

                        if (!bSelected) {
                            const oContext = item.getBindingContext();
                            if (oContext) {
                                const oModel = oContext.getModel();
                                const sPath = oContext.getPath();
                                oModel.resetChanges([sPath]);
                            }
                        }
                    }
                });
            });
        },

        onModifyRatingPress: async function () {
            sap.ui.core.BusyIndicator.show(0);
            await this._updateProduct().then(() => {
                sap.ui.core.BusyIndicator.hide();
                MessageBox.success("Product updated successfully", { title: "Success" });
                const oProductTable = this.byId("productsTable");
                oProductTable.removeSelections(true);
                oProductTable.getSelectedItems().length > 0 ?
                    this.getOwnerComponent().getModel("ui").setProperty("/editEnabled", true) :
                    this.getOwnerComponent().getModel("ui").setProperty("/editEnabled", false);

                oProductTable.getItems().forEach(item => {
                    item.getCells().forEach(cell => {
                        const oBindInfo = cell.getBindingInfo("value");
                        if (oBindInfo && oBindInfo.binding.getPath() === "Rating") {
                            cell.setEnabled(false);
                        }
                    });
                });
            });

        },

        _updateProduct: function () {
            return new Promise((resolve, reject) => {
                const aSelectedItems = this.byId("productsTable").getSelectedItems();
                aSelectedItems.forEach(item => {
                    const oContext = item.getBindingContext();
                    const oData = oContext.getObject();
                    oContext.getModel().update(oContext.getPath(), oData, {
                        success: resolve,
                        error: reject
                    });
                });
            });
        }
    });
});