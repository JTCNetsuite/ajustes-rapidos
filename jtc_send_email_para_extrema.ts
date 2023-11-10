/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */
 

import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as email from 'N/email'
import * as record from 'N/record'
import * as file from 'N/file'

export const afterSubmit: EntryPoints.UserEvent.afterSubmit = (ctx: EntryPoints.UserEvent.afterSubmitContext) => {
    try {
       
            const curr = ctx.newRecord

            const subsidiary = curr.getValue("subsidiary")
            const nf = curr.getValue('custbody_enl_fiscaldocnumber')
            const transportadora = curr.getValue('custbody_enl_carrierid')
            

            
    
            // if (subsidiary == 7 || subsidiary == '7') {
                if (!!nf) {
                    const link_nf = curr.getValue('custbody_enl_linknotafiscal')
                    const searchXML = search.create({
                        type: search.Type.FOLDER,
                        filters: [
                            ['file.name', search.Operator.CONTAINS, nf],
                            "AND",
                            ["file.filetype", search.Operator.ANYOF, "XMLDOC"]
                        ],
                        columns: [
                            search.createColumn({
                                name: 'url',
                                join: 'file'
                            }),
                            search.createColumn({
                                name: 'internalid',
                                join: 'file'
                            })
                        ]
                    }).run().getRange({start: 0, end:1})
    
                    log.debug("searchXMl", searchXML)
                    
                    const recordTransportadora = record.load({
                        type: 'customrecord_enl_transportadoras',
                        id: transportadora
                    })
    
                    const fonecedor_trans = recordTransportadora.getValue("custrecord_enl_codigotransportadoras")
                    
                    const recordForncedor = record.load({
                        type: record.Type.VENDOR,
                        id: fonecedor_trans
                    })
    
                    const email_trans = String(recordForncedor.getValue('email'))
    
                    log.debug("email transportador", email_trans)
                    
                    if (searchXML.length > 0 && !!email_trans) {
                        const idFile: any = searchXML[0].getValue({name: 'internalid', join: 'file'})
                        log.debug("idFile", idFile)
    
                        const fileXml = file.load({id: idFile})

                        
                        if (subsidiary == "7" || subsidiary == 7) {
                            const body = `Segue o anexo do Xml <br></br>
                                <a href="${link_nf}">Link da nf</a>
                                `
                       
                            email.send({
                                author: 4,
                                body: body,
                                subject: `NF ${nf}`,
                                recipients: [email_trans],
                                // cc: ['denis@jtcd.com.br'],
                                attachments: [fileXml]
                            })
        
                            const invoice = record.load({type: record.Type.INVOICE, id: ctx.newRecord.id})
        
                            invoice.setValue({fieldId: 'custbody_jtc_envio_email_transportador', value: true})
                            invoice.save({ignoreMandatoryFields: true})
                        }

                        enviarEmailParaCliente(ctx, link_nf, fileXml)
    
                    }
    
                    
                    
                }
            // }
        

    } catch (error) {
        log.error("jtc_send_email_para_extrema.afterSubmit", error)
    }
}


const enviarEmailParaCliente = (ctx: EntryPoints.UserEvent.afterSubmitContext, link_nf, fileXml: file.File) => {
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

        if (searchEmails.length  > 0 ) {
            const recipients: any[] = [
                searchEmails[0].getValue({name: 'email', join: 'partner'}),
                searchEmails[0].getValue({name: 'email', join: 'customer'})
            ]
            log.debug("recepientes",recipients)
            try {
                email.send({
                    author: 7134,
                    body: `Olá, ${nome_cliente}! <br></br>Informamos que o seu pedido da JTC Distribuidora foi ENVIADO. Seguem a Nota Fiscal em PDF e o XML anexos. Para demais informações, entre em contato com nosso setor de vendas. <br></br> <a href="${link_nf}">acesse sua nf clicando aqui!</a>`,
                    subject: String(pedido_vendas),
                    recipients: recipients,
                    attachments: [fileXml]
                })
                log.audit("Email Enviado", "ENVIADO")
            } catch (error) {
                log.error("jtc_send_email_erro.ENVIADO", error)
            }
        }
        


    } catch (error) {
        log.error("jtc_send_email_para_extrema.enviarEmailParaCliente", error)
    }
}