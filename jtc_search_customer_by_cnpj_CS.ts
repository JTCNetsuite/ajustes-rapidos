



import { EntryPoints } from 'N/types'
import * as query from 'N/query'



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
                if (clientQuery.length > 1) {
                    alert("Esse CNPJ tem mais de dois clientes separados")
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