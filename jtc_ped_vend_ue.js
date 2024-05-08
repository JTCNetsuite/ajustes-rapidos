/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope Public
 *
 */

define(['N/record', 'N/log', 'N/runtime'],

    function (record, log, runtime) {

        function beforeLoad (scriptContext) {

            var rec = scriptContext.newRecord;
            var userObjID = runtime.getCurrentUser().id

            // Preenche campo "Lançador do Pedido"
            if (rec.type == 'invoice' ) {
                log.debug("invoce do tipo")
            } else {
                log.debug("sales order tipo")
                if (scriptContext.type == scriptContext.UserEventType.CREATE){

                    rec.setValue({ fieldId: 'custbody_jtc_lanc_ped', value: userObjID})
                } 
            }
        }

        function afterSubmit (scriptContext) {

            var rec = scriptContext.newRecord;
            var lineItemCount = rec.getLineCount({ sublistId: 'item' });
            var cRec_id = rec.id;
            var cRec_type = rec.type;

            var totalQuantidade = 0
            var totalLiquido = 0
            var totalBruto = 0

            if(scriptContext.type != scriptContext.UserEventType.DELETE) {

                for (var i = 0; i < lineItemCount; i++) {

                    totalQuantidade += parseFloat(rec.getSublistValue({ 
                        sublistId: 'item', 
                        fieldId: 'quantity', 
                        line: i }) );

                    totalLiquido += parseFloat(rec.getSublistValue({ 
                        sublistId: 'item', 
                        fieldId: 'custcol_jtc_peso_liquido_kg', 
                        line: i }) );

                    totalBruto += parseFloat(rec.getSublistValue({ 
                        sublistId: 'item', 
                        fieldId: 'custcol_jtc_peso_bruto_kg', 
                        line: i }) );
                }

                var salesOrder = record.load({
                    type: cRec_type,
                    id: cRec_id,
                })

                if (!!totalQuantidade){
                    salesOrder.setValue({
                        fieldId: 'custbody_enl_volumesqty',
                        value: totalQuantidade,
                        ignoreFieldChange: false
                    })
                }
                if (!!totalLiquido){
                    salesOrder.setValue({
                        fieldId: 'custbody_enl_netweight',
                        value: totalLiquido,
                        ignoreFieldChange: false
                    })
                }
                if (!!totalBruto){
                    salesOrder.setValue({
                        fieldId: 'custbody_enl_grossweight',
                        value: totalBruto,
                        ignoreFieldChange: false
                    })
                }
                salesOrder.setValue({
                    fieldId: 'custbody_enl_volumetype',
                    value: 'Volume',
                    ignoreFieldChange: false
                })

                salesOrder.save();
            }
        }

        return {
            beforeLoad: beforeLoad,
            afterSubmit: afterSubmit
        };
    }
);