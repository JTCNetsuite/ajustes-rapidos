/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as email from "N/email"
import * as search from 'N/search'



export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (ctx: EntryPoints.UserEvent.afterSubmitContext) => {
    try {
        
        const curr = ctx.newRecord
        const idSalesOrd = curr.getValue("createdfrom")
        const nome_cliente = curr.getText("entity")

        log.debug("type", curr.type)
        const status = curr.getValue("shipstatus")

        const pedido_vendas =curr.getText("createdfrom")

        const searchEmails = search.create({
            type: search.Type.SALES_ORDER,
            filters: [
                ["internalid", search.Operator.ANYOF, idSalesOrd],
                "AND",
                ["mainline", search.Operator.IS, "T"]
            ],
            columns: [
                search.createColumn({name: "tranid", label: "Número do documento"}),
                search.createColumn({name: "entity", label: "Nome"}),
                search.createColumn({name: "partner", label: "Parceiro"}),
                search.createColumn({
                    name: "email",
                    join: "partner",
                    label: "E-mail"
                }),
                search.createColumn({
                    name: "email",
                    join: "customer",
                    label: "E-mail"
                 })
            ]
        }).run().getRange({start: 0, end: 1})

        if (searchEmails.length > 0) {
            const recipients: any[] = [
                searchEmails[0].getValue({name: 'email', join: 'partner'}),
                searchEmails[0].getValue({name: 'email', join: 'customer'})
            ]
            log.debug("emails", recipients)

            if (status == "B") {
                try {
                    email.send({
                        author: 7134,
                        body: `Olá ${nome_cliente}! <br></br>Informamos que o seu pedido da JTC Distribuidora foi SEPARADO, e já está pronto para expedição. Para mais informações, por favor entre em contato com nosso setor de vendas.`,
                        subject: String(pedido_vendas),
                        recipients: recipients
                    })
                } catch (error) {
                    log.error("jtc_send_email_erro.SEPARADO", error)
                }
               
            } else if (status == "C") {
                // try {
                //     email.send({
                //         author: -5,
                //         body: `Prezado cliente! <br></br>Informamos que o seu pedido da JTC Distribuidora foi ENVIADO`,
                //         subject: String(pedido_vendas),
                //         recipients: ['edison@jtcd.com.br']
                //     })
                // } catch (error) {
                //     log.error("jtc_send_email_erro.ENVIADO", error)
                // }
            }
        }

        



    } catch (error) {
        log.error("jtc_send_email_na_separcao_UE.afterSubmit", error)
    }
}

