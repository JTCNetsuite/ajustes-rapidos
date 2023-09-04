/**
 * @NAPIVersion 2.x
 * @NModuleScope public
 */



export const constant = {
    SEARCHS: {
        INVOICE_PEDDING_APPROVAL: 'customsearch273'
    },
    INVOICE: {
        STATUS: 'approvalstatus',
        SUBLIST_INSTALLMENT: {
            ID: 'installment',
            ID_INSTALLMENT: 'id',
            VALOR: 'amount'
        }
    },
    PURCHASE_ORDER: {
        SUBSIDIARY: 'subsidiary',
        SUBLIST_ITEM: {
            ID: 'item',
            
        },
        SUBRECORD_INVENTORY_DETAIL: {
            ID: 'inventorydetail',
            SUBLIST_INVENTORY_DETAIL: {
                ID: 'inventoryassignment',
                NUM_SERIAL: 'receiptinventorynumber',
                QUATITY: 'quantity',
                EXPIRATION_DATE: 'expirationdate'
            },
        }
    },
    ITEM_RECEIPT: {
        CREATRED_FROM: 'createdfrom',
        SUBLIST_ITEM: {
            ID: 'item',
            
        },
        SUBRECORD_INVENTORY_DETAIL: {
            ID: 'inventorydetail',
            SUBLIST_INVENTORY_DETAIL: {
                ID: 'inventoryassignment',
                NUM_SERIAL: 'receiptinventorynumber',
                QUATITY: 'quantity',
                EXPIRATION_DATE: 'expirationdate'
            },
        }
    },

    SALES_ORDER: {
        LANCADOR_PEDIDO: 'custbody_jtc_lanc_ped',
        SUBSIDIARY: 'subsidiary',
        SUBLIST_ITEM: {
            ID: 'item',
            FIELDS:{
                ITEM: 'item',
                QTDE: 'quantity'
            }
        }
    },
    INVENTORY_NUMBER: {
        INV_ITEM: 'inventorynumber.item',
        LOCATION: "location",
        NUMBER_SERIAL: 'inventorynumber'
    },

    INVENTORY_DETAIL: {
        ID: 'inventorydetail',
        ID_SUB: 'inventoryassignment',
        QUANTITY: 'quantity',
        SERIAL_LOTE: 'issueinventorynumber'

    }

}