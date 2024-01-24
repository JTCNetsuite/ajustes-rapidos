/**
 * @NAPIVersion 2.x
 * @NScriptType MapReduceScript
 */


import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as search from 'N/search'
import * as record from 'N/record'
import * as https from 'N/https'
import * as query from 'N/query'

export const getInputData: EntryPoints.MapReduce.getInputData = () => {
    try {
        // const data = getIntergrcaoBB()
        // const token = getAccessToken(data.url_token, data.authorization)
        // const authObj = token.body.token_type + " " + token.body.access_token

        // const headers = {
        //     Authorization: authObj,
        //     Accept: 'application/json',
        // };

        // const boletos = [];

        // let indice = 0;

        // while (true) {
        //     let url = `https://api.bb.com.br/cobrancas/v2/boletos?gw-dev-app-key=4a5e515a85aa0cb8a74b71646d5ec025&indicadorSituacao=A&agenciaBeneficiario=3221&contaBeneficiario=19570&boletoVencido=S&indice=${indice}`;

        //     const response = JSON.parse(https.get({url: url, headers: headers}).body)
        //     // log.debug("response", response)

        //     const indicador = response.indicadorContinuidade;

        //     if (indicador === 'S') {
        //         indice = response.proximoIndice;
        //           url +=`&indice=${indice}`;
        //         const boletosData = response.boletos;
        //         boletos.push(...boletosData);
        //     } else {
        //         const boletosData = response.boletos;
        //         boletos.push(...boletosData);
        //         break;
        //     }
        // }

        // return boletos;

        return search.create({
            type: "invoice",
            filters:
            [
               ["type","anyof","CustInvc"], 
               "AND", 
               ["mainline","is","T"], 
               "AND", 
               ["installment.daysoverdue","greaterthan","1"], 
               "AND", 
               ["installment.amountpaid","equalto","0.00"], 
               "AND", 
               ["status","noneof","CustInvc:V","CustInvc:E"]
            ],
            columns:
            [
               search.createColumn({
                  name: "trandate",
                  sort: search.Sort.DESC,
                  label: "Data"
               }),
               search.createColumn({
                  name: "tranid",
                  sort: search.Sort.DESC,
                  label: "Num. CR"
               }),
               search.createColumn({name: "type", label: "Tipo"}),
               search.createColumn({name: "entity", label: "Nome"}),
               search.createColumn({name: "custbody_enl_fiscaldocnumber", label: "Nota Fiscal"}),
               search.createColumn({name: "statusref", label: "Status"}),
               search.createColumn({
                  name: "installmentnumber",
                  join: "installment",
                  sort: search.Sort.ASC,
                  label: "Parcela"
               }),
               search.createColumn({
                  name: "daysoverdue",
                  join: "installment",
                  label: "Dias Atraso"
               }),
               search.createColumn({
                  name: "duedate",
                  join: "installment",
                  label: "Data de vencimento"
               }),
               search.createColumn({
                  name: "status",
                  join: "installment",
                  label: "Status Parcela"
               }),
               search.createColumn({
                  name: "amount",
                  join: "installment",
                  label: "Prestação "
               }),
               search.createColumn({name: "amount", label: "Valor Total"}),
               search.createColumn({name: "appliedtotransaction", label: "Aplicados à transação"}),
               search.createColumn({
                  name: "amountpaid",
                  join: "installment",
                  label: "Valor pago"
               })
            ]
         })
    } catch (error) {
        log.error("jtc_baixar_installmentst_on_bank_MR.getInputData", error)
    }
} 


// export const map: EntryPoints.MapReduce.map = (ctx: EntryPoints.MapReduce.mapContext) => {
//     try {
        
//         const invoiceData = JSON.parse(ctx.value)
//         log.debug("invoice", invoiceData)
//         const idInvoice = invoiceData.id
//         const num_parcela = Number(invoiceData.values['installmentnumber.installment'])

//         const sql = `SELECT 
//         custrecord_dk_cnab_nosso_numero, 
//         custrecord_dk_cnab_num_titbeneficiario,
//         custrecord_dk_cnab_utilizar_beneficiario, id
//         FROM customrecord_dk_cnab_aux_parcela
//         WHERE custrecord_dk_cnab_transacao = ${idInvoice} AND custrecord_dk_cnab_utilizar_beneficiario LIKE '%${num_parcela}%'`


//         const cnabParcela = query.runSuiteQL({
//             query: sql
//         }).asMappedResults()
//         // log.debug("cnabParcela", cnabParcela)

//         const nossoNumero = cnabParcela[0].custrecord_dk_cnab_nosso_numero

        
//         const url = `https://api.bb.com.br/cobrancas/v2/boletos/${nossoNumero}?gw-dev-app-key=4a5e515a85aa0cb8a74b71646d5ec025&numeroConvenio=2202864`
        
//         const data = getIntergrcaoBB()
//         const token = getAccessToken(data.url_token, data.authorization)
//         const authObj = token.body.token_type + " " + token.body.access_token

//         const headers = {
//             Authorization: authObj,
//             Accept: 'application/json',
//         }

//         const boletoIndividualRequest = https.get({
//             url: url,
//             headers: headers
//         })

//         if (boletoIndividualRequest.code == 200) {
//             const boleto = JSON.parse(boletoIndividualRequest.body)
            
            
//             if (boleto.valorPagoSacado > 0 ) {
//                 log.audit("boleto Encotrado: "+ nossoNumero, boleto.valorPagoSacado)
//                 const dtPagamento = String(boleto.dataCreditoLiquidacao).split(".")

//                 const custmerPayment = record.transform({
//                     fromId: idInvoice,
//                     fromType: record.Type.INVOICE,
//                     toType: record.Type.CUSTOMER_PAYMENT
//                 })
//                 const subId = custmerPayment.getValue('subsidiary')
//                 if (subId == 3) {
//                     custmerPayment.setValue({fieldId: 'account', value: 620})
//                     // custmerPayment.setValue({fie ldId: CTS.COSTUMER_PAYMENT.ACCOUNT_CUSTOM, value: 620})
//                 } else if(subId == 5)  {
//                     custmerPayment.setValue({fieldId: 'account', value: 726})
//                     custmerPayment.setValue({fieldId: 'custbody_jtc_cont_banc_inter', value: 620})
//                 } else {
//                     custmerPayment.setValue({fieldId: 'custbody_jtc_cont_banc_inter', value: 620})
//                 }

//                 const sublistId =  'apply'
//                 const lineCount = custmerPayment.getLineCount({sublistId: sublistId})


               

//                 custmerPayment.setValue({fieldId: 'payment', value: boleto.valorPagoSacado})
//                 custmerPayment.setValue({
//                     fieldId: 'trandate',
//                     value: new Date(`${dtPagamento[1]}/${dtPagamento[0]}/${dtPagamento[2]}`)
//                 })

//                 for (var i = 0; i < lineCount; i++) {
//                     custmerPayment.setSublistValue({
//                         sublistId: sublistId,
//                         fieldId: 'apply',
//                         line: i,
//                         value: false
//                     })
    
//                     const idInvoiceFromSublist = custmerPayment.getSublistValue({
//                         sublistId: sublistId,
//                         fieldId: 'doc',
//                         line: i
//                     })
//                     const numInstallmentFromSublist = custmerPayment.getSublistValue({
//                         sublistId: sublistId,
//                         fieldId: 'installmentnumber',
//                         line: i
//                     })
                    
    
//                     if (idInvoiceFromSublist == idInvoice && numInstallmentFromSublist == num_parcela) {
//                         log.debug("igual e setar", "START")
//                         custmerPayment.setSublistValue({
//                             sublistId: sublistId,
//                             fieldId: 'apply',
//                             line: i,
//                             value: true
//                         })
//                         const f = custmerPayment.getSublistValue({
//                             sublistId: sublistId,
//                             fieldId: 'apply',
//                             line: i
//                         })
//                         log.debug("OK", f)
//                     }
//                 }

//                 const idCostumrPay = custmerPayment.save()

//                 if (!!idCostumrPay) {
//                     const recParcela = record.load({
//                         id: cnabParcela[0].id,
//                         type: 'customrecord_dk_cnab_aux_parcela'
//                     })
//                     recParcela.setValue({fieldId: 'custrecord_jtc_int_boleto_pago', value: true })
//                     const idRet = recParcela.save()
//                     log.audit("id Custumer ", idCostumrPay)
//                     log.audit("id ParcelaCnab ", idRet)
//                 }

//             }
//         } else {
//             log.debug("boleto Não Encontrado", nossoNumero)
//         }

        
//     } catch (error) {
//         log.error("errro", error)
//     }
// }


const getAccessToken = (url_token, authorization) => {
    try {
        
        const urlObj = String(url_token);

        const bodyObj = {
                "grant_type": "client_credentials",
                "scope": "cobrancas.boletos-info cobrancas.boletos-requisicao"
        };

        const authObj = authorization; //* alterado basic pelo de produção;

        const headerArr = {};
        headerArr['Authorization'] = authObj;
        headerArr['Accept'] = 'application/json';

        const response = https.post({
                url: urlObj,
                body: bodyObj,
                headers: headerArr
        });


        return {
            body: JSON.parse(response.body),
        };

    } catch (e) {
            log.error('getAccessToken',e);
    }
}

const CTS = {
    INTEGRACAO_BB:{
        ID: 'customrecord_jtc_rt_integracao_bb',
        KEY: 'custrecord_jtc_int_bb_key',
        URL_TOKEN: 'custrecord_jtc_int_bb_url_token',
        AUTHORIZATION: 'custrecord_jtc_int_bb_authorization',
        CONTA: 'custrecord_jtc_int_bb_conta',
        AGENCIA: 'custrecord_jtc_int_bb_agencia'
    },

    PARCELA_CNAB: {
        ID: 'customrecord_dk_cnab_aux_parcela',
        TRANSACTION: 'custrecord_dk_cnab_transacao',
        NOSSO_NUMERO: 'custrecord_dk_cnab_nosso_numero',
        DATA_VENCIMENTO: 'custrecord_dk_cnab_dt_vencimento',
        PAGAMENTO: 'custrecord_dk_cnab_transacao_pg',
        BOLETO_PAGO: 'custrecord_jtc_int_boleto_pago',
        NUM_CONVENIO: 'custrecord_dk_cnab_numero_convenio'
    },
    INVOICE: {
        ID: 'invoice',
        INTERNALID: 'internalid',
        STATUS: 'approvalstatus'
    },
    CUSTOMER_PAYMENT: {
        ID: 'customerpayment',
        CONTA_BANCARIA: "custbody_jtc_cont_banc_inter",
        TRANDATE: 'trandate',
        DIFENCA_PAGO: 'custbody_jtc_int_dif_valor_org_pago',
        SUBLIST_INSTALL: {
            ID: 'apply',
            FIELDS: {
                REFNUM: 'refnum',
                APPLY: 'apply',
                DATA_VENCIMENTO: 'applyduedate'
            }
        }
    }
}

const getIntergrcaoBB = () => {
    try{
        const searchIntegracaoBB = search.create({
            type: CTS.INTEGRACAO_BB.ID,
            filters: [],
            columns: [
                search.createColumn({name: CTS.INTEGRACAO_BB.KEY}),
                search.createColumn({name: CTS.INTEGRACAO_BB.URL_TOKEN}),
                search.createColumn({name: CTS.INTEGRACAO_BB.AUTHORIZATION}),
                search.createColumn({name: CTS.INTEGRACAO_BB.CONTA}),
                search.createColumn({name: CTS.INTEGRACAO_BB.AGENCIA})
            ]
        }).run().getRange({start: 0, end: 1});

        if (searchIntegracaoBB.length > 0) {
            return {
                'key': searchIntegracaoBB[0].getValue({name: CTS.INTEGRACAO_BB.KEY}),
                'url_token': searchIntegracaoBB[0].getValue({name: CTS.INTEGRACAO_BB.URL_TOKEN}),
                'authorization': searchIntegracaoBB[0].getValue({name: CTS.INTEGRACAO_BB.AUTHORIZATION}),
            };
        } else {
            throw {
                'msg': 'cadastrar RT INTEGRACAO BB'
            };
        }
    } catch (e) {
        log.error('getIntergrcaoBB',e);
        throw e
    }

}


const extrairNumeroNF = (str) => {
    // Verifica se a string contém "NF"
    if (str.includes("NF")) {
        // Usa expressão regular para extrair o número entre "NF" e "-"
        const regex = /NF(\d+)-/;
        const match = str.match(regex);

        // Verifica se houve correspondência com a expressão regular
        if (match && match[1]) {
            // Retorna o número extraído
            return match[1];
        } else {
            // Caso não seja possível extrair o número, retorna null ou uma mensagem de erro
            return null;
        }
    } else {
        // Caso "NF" não esteja contido na string, retorna null ou uma mensagem de erro
        return null;
    }
}