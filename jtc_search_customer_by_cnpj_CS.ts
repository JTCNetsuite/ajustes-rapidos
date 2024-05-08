/**
 * @NApiVersion         2.x
 * @NScriptType         ClientScript
 */




import { EntryPoints } from 'N/types'
import * as query from 'N/query'
import * as runtime from 'N/runtime'


export const fieldChanged: EntryPoints.Client.fieldChanged = (ctx: EntryPoints.Client.fieldChangedContext) => {
    try {
        if (ctx.fieldId == 'custbody_jtc_cnpjcpf_pedido') {
            const curr = ctx.currentRecord
            console.log("campo mudado")
            const cnpj = curr.getValue("custbody_jtc_cnpjcpf_pedido")
            const sql = `SELECT id, companyname FROM customer WHERE custentity_enl_cnpjcpf='${cnpj}'`
            const clientQuery = query.runSuiteQL({
                query: sql
            }).asMappedResults()


            if (clientQuery.length == 0) {
                alert("Esse CNPJ não existe")
                
            } else {
                if (clientQuery.length > 1) {
                    alert("Esse CNPJ tem mais de dois clientes cadastrado")
                    curr.setValue({
                        fieldId: 'custbody_jtc_cnpjcpf_pedido',
                        value: '',
                        ignoreFieldChange: true
                    })
                } else {
                    curr.setValue({
                        fieldId: 'entity',
                        value: clientQuery[0].id
                    })
                }
            }
            
        }


    } catch (error) {
        
    }
}

export const pageInit: EntryPoints.Client.pageInit = (ctx: EntryPoints.Client.pageInitContext) => {
    try {
        const currUser = runtime.getCurrentUser()

        if (currUser.role == 1454 ) {
            const curr = ctx.currentRecord
            curr.getField({fieldId: 'partner'}).isDisabled
            curr.setValue({fieldId: 'partner', value: currUser.id})

        }

    } catch (error) {
        console.log("jtc_search_customer_by_cnpj_CS.pageInit", error)
    }
}