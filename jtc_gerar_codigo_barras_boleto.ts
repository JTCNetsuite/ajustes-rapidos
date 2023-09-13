/**
 * @NAPIVersion 2.x
 * @NScriptType UserEventScript
 */

import { EntryPoints } from 'N/types'
import * as log from 'N/log'
import * as record from 'N/record'
import * as format from 'N/format'
import * as file from 'N/file'

export const beforeSubmit: EntryPoints.UserEvent.beforeSubmit = (ctx:EntryPoints.UserEvent.beforeSubmitContext) => {
    
    const curr = ctx.newRecord

    const dt_v= String(curr.getValue('custrecord_dk_cnab_dt_vencimento')).split('.')
    
    const formtDate = `${dt_v[1]}/${dt_v[0]}/${dt_v[2]}`

    const valor_org = Number(curr.getValue('custrecord_dk_cnab_val_orig')).toFixed(2)
    log.debug("valor_org", valor_org)

    const valor = adicionarDezAEsquerda(String(valor_org))
    log.debug("valor", valor)
    
    const fator_date = calcularDiferencaDias('10/07/1997', formtDate)
    log.debug("fator_date", fator_date)
    
    const nosso_num = `000${curr.getValue('custrecord_dk_cnab_nosso_numero')}`
    log.debug('noss_num', nosso_num)

    const carteira = curr.getValue('custrecord_dk_cnab_carteira')
    

    let cod_barras =`0019${fator_date}${valor}${nosso_num}${carteira}`
    log.debug('cod', cod_barras)

    let mult = 11 - multiplicarStringPorPesosCiclo(cod_barras, [2, 3, 4,5,6,7,8,9])
    if (mult == 0 || mult == 10 || mult == 11) {
        mult = 1
    }
    log.debug("mukl", mult)

    const complete_cod = `0019${mult}${fator_date}${valor}${nosso_num}${carteira}`
    log.audit("completo", complete_cod)

    let linha_digt = `0019${complete_cod.substring(20,25)}${complete_cod.substring(24,34)}${complete_cod.substring(34,44)}${mult}${fator_date}${valor}`

    log.debug("linha digitalvel", linha_digt)

    let linh_campos=  `0019${complete_cod.substring(20,25)}${complete_cod.substring(24,34)}${complete_cod.substring(34,44)}`
    log.debug("linha", linh_campos)
    const digitos =  multplicarStringLinha(linh_campos, [2,1])
    let linha_completa = `0019${complete_cod.substring(20,25)}${digitos[0]}${complete_cod.substring(24,34)}${digitos[1]}${complete_cod.substring(34,44)}${digitos[2]}${mult}${fator_date}${valor}`

    log.audit('linha completa',linha_completa)

    curr.setValue({fieldId: 'custrecord_jtc_linha_digitavel_aut', value: linha_completa})
    curr.setValue({fieldId: 'custrecord_dk_cnab_line_digitable', value: linha_completa})

    curr.setValue({fieldId: 'custrecord_jtc_codg_barras_autc', value: complete_cod})
    curr.setValue({fieldId: 'custrecord_dk_cnab_barcode', value: complete_cod})

}   


const calcularDiferencaDias = (dataInicial: string, dataFinal: string) => {
    const dataInicialObj = new Date(dataInicial).getTime();
    const dataFinalObj = new Date(dataFinal).getTime();
  
    // Calcula a diferença em milissegundos
    const diferencaMilissegundos = dataFinalObj - dataInicialObj;
  
    // Converte a diferença em dias
    const diferencaDias = Math.floor(diferencaMilissegundos / (1000 * 60 * 60 * 24));
  
    return String(diferencaDias);
}

const adicionarDezAEsquerda = (str) => {

    str = str.replace(/[.,\s]/g, '')
    if (str.length < 10) {
        // Calcula quantos zeros devem ser adicionados
        const zerosParaAdicionar = 10 - str.length;
        
        // Adiciona os zeros à esquerda da string
        for (let i = 0; i < zerosParaAdicionar; i++) {
        str = '0' + str;
        }
    }
    return str;
}

const multiplicarStringPorPesosCiclo = (string, pesos) =>{
    let resultado = 0;
    let pesoIndex = 0; // Começar com o primeiro peso

    for (let i = string.length - 1; i >= 0; i--) {
        const elemento = parseInt(string[i], 10);
        const peso = pesos[pesoIndex % pesos.length]; // Ciclo de pesos

        // Verifica se o elemento é um número válido
        if (isNaN(elemento)) {
        throw new Error('A string deve conter apenas dígitos.');
        }

        // Verifica se o peso está dentro do intervalo válido (2 a 9)
        if (peso < 2 || peso > 9) {
        throw new Error('Os pesos devem variar de 2 a 9.');
        }

        resultado += elemento * peso;
        pesoIndex++;
    }

    return resultado % 11;
}

const multplicarStringLinha = (string: string, pesos) => {
    let res = []
    for (var i = 0; i < string.length; i++) {
        // log.debug('i',string[i])
        const num = Number(string[i])

        if (i % 2 == 0) {
            res.push([num, 2])
        } else {
            res.push([num,1])
        }

    }
    const primeiro_campo = res.slice(0,9)
    const segundo_campo = res.slice(9,19)
    const terciro_campo = res.slice(19,30)

    let sum_1 = somaDosCampos(primeiro_campo) 
    log.debug('soma1', sum_1)
    let d_1 = subtrairDezenaPosterior(sum_1)
    log.debug("d_1",d_1)
    
    let sum_2 = somaDosCampos(segundo_campo) 
    log.debug('soma2', sum_2)
    
    let d_2 = subtrairDezenaPosterior(sum_2)
    log.debug("d_2",d_2)
    
    let sum_3 = somaDosCampos(terciro_campo) 
    log.debug('soma3', sum_3)
    let d_3 = subtrairDezenaPosterior(sum_3)
    log.debug('d_3', d_3)
    
    
    return [d_1,d_2,d_3]
         
}

const somaDosCampos = (array) => {
    let soma = 0
    for (var j=0; j < array.length; j++) {
        var x = array[j][0] * array[j][1]
        var y
        if (x >= 10) {
            y = String(x)
            soma += (Number(y[0]) + Number(y[1]))

        } else {
            soma += x
        }
        // log.audit(y, x)
        y = undefined  
    }

    return soma
}
const subtrairDezenaPosterior = (numero) =>{
    // Verifica se o número é inteiro e positivo
    if (numero >= 10) {
        // Pega a dezena posterior
        const dezenaPosterior = Math.ceil((numero % 100) / 10);
        // console.log(dezenaPosterior)

        // Subtrai o número pela dezena posterior
        const resultado = dezenaPosterior * 10 - numero;

        return resultado;
    } else {
        return "O número não é inteiro positivo com pelo menos duas casas decimais.";
    }
}

export const afterSubmit:EntryPoints.UserEvent.afterSubmit = (ctx: EntryPoints.UserEvent.afterSubmitContext) => {
    try {
        bankSlipHTML(ctx.newRecord.id)
    } catch (error) {
        log.error("jtc_gerar_codigo_barras.afterSubmit",error)
    }
}

const bankSlipHTML = (idRec) => {
    try {
        const setBankSlip = record.load({
            type: 'customrecord_dk_cnab_aux_parcela',
            id: idRec,
            isDynamic: true
        })

        const digitableLine = setBankSlip.getValue('custrecord_dk_cnab_line_digitable')
        const dueDate = setBankSlip.getValue('custrecord_dk_cnab_dt_vencimento')
        const beneficiaryName = String(setBankSlip.getValue('custrecord_dk_cnab_benficiario_nome')).toUpperCase()
        const beneficiaryCnpj = setBankSlip.getValue('custrecord_dk_cnab_benfic_num_inscricao')
        const beneficiaryAgency = '452' //*TROCAR PELO NÚMERO DA AGÊNCIA
        const invoiceDate = setBankSlip.getValue('custrecord_dk_cnab_dt_emiss')
        const invoiceNumber = setBankSlip.getValue('custrecord_dk_cnab_num_titbeneficiario')
        const kindDocument = setBankSlip.getValue('custrecord_dk_cnab_descricao_titulo')
        const bankSlipAcceptance = setBankSlip.getValue('custrecord_dk_cnab_codigo_aceite')
        const processingDate = setBankSlip.getValue('custrecord_dk_cnab_dt_emiss')
        const ourBankSlipNumber = setBankSlip.getValue('custrecord_dk_cnab_nosso_numero')
        const bankAccountNumber = setBankSlip.getValue('custrecord_dk_cnab_numero_convenio') //*TROCAR PELO NÚMERO DA CONTA BANCÁRIA
        const amountDue = Number(setBankSlip.getValue('custrecord_dk_cnab_val_orig')).toFixed(2)
        const installment = setBankSlip.getValue('custrecord_dk_cnab_mensagem_bloqueto')
        const interestRate = setBankSlip.getValue('custrecord_dk_cnab_jurosmora_porcentagem') //*taxa de juros a.m.
        const billingWallet = setBankSlip.getValue('custrecord_dk_cnab_carteira')
        const payerName = String(setBankSlip.getValue('custrecord_dk_cnab_pagador_nome')).toUpperCase()
        const payerCnpj = String(setBankSlip.getValue('custrecord_dk_cnab_pagador_num_inscricao'))
        const payerStreet = String(setBankSlip.getValue('custrecord_dk_cnab_pagador_endereco')).toUpperCase()
        const payerCity = String(setBankSlip.getValue('custrecord_dk_cnab_pagador_cidade')).toUpperCase()
        const payerUf = String(setBankSlip.getValue('custrecord_dk_cnab_pagador_uf')).toUpperCase()
        const payerNeighborhood = String(setBankSlip.getValue('custrecord_dk_cnab_pagador_bairro')).toUpperCase()
        const payerZipCode = String(setBankSlip.getValue('custrecord_dk_cnab_pagador_cep'))
        const barsCode = setBankSlip.getValue('custrecord_dk_cnab_barcode').toString()
        const formatDigitableLine = formattedDigitableLine(digitableLine)

        const beneficiaryCnpjString = formatCNPJ(beneficiaryCnpj)
        const payerCnpjString = formatCNPJ(payerCnpj)
        const realBR = formatBRL(amountDue)

        log.debug({
            title: 'linha 442 - cnpj convertidos em string',
            details: 'JTC - cnpj: ' + beneficiaryCnpjString + '  >> Pagador cnpj: ' + payerCnpjString + '  >> R$ ' + realBR
        })


        var bankSlip = "<!DOCTYPE html>"
        bankSlip += "<html>"
        bankSlip += "<head>"
        bankSlip += "<script src=\"https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js\"></script>"
        bankSlip += "<meta charset=\"utf-8\">"
        bankSlip += "<!--Configurar para português - Produzio RGR -->"
        bankSlip += "<title>Boleto Bancário</title>"
        bankSlip += "<link rel=\"stylesheet\" href=\"boleto_bancario.css\">"
        bankSlip += "<!---Página - Boleto Bancário -->"
        bankSlip += "</head>"
        bankSlip += "<body style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">"
        bankSlip += "<h3>Ficha de Compensação</h3>"
        bankSlip += "<div>"
        bankSlip += "<table style=\"line-height: 250%;\">"
        bankSlip += "<tr style=\"width: 100%;\" class=\"tam_fonte\">"
        bankSlip += "<th style= \"border: 1px solid black;\ line-height: 250%; height: 70px;\"  colspan=\"2\"><img src=\"https://7414781.app.netsuite.com/core/media/media.nl?id=19580&c=7414781&h=8vnvtehOlslhPRNq6-AIuNA9Oz1eCVIj6tAe2aZdiZ0ThKjK\" alt=\"Banco do Brasil\" width=\"100%\" height=\"100%\"></th>"
        bankSlip += "<th style= \"border: 1px solid black; height: 30px;\"  class=\"head_fonts\">001-9</th>"
        bankSlip += "<th style= \"border: 1px solid black; height: 30px;\"  colspan=\"4\" class=\"head_fonts\">" + formatDigitableLine + "</th>"
        bankSlip += "</tr>"
        bankSlip += "<tr style=\"line-height: 0.2;  height: 20px;\">" //* alterado a altura pra 20 px
        bankSlip += "<td style= \"border: 1px solid black; height: 50px; width: 75%;\" colspan=\"5\" >" //* height modified
        bankSlip += "<label  style=\"font-size: 9px;\">Local de pagamento</label><br></br>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">Pagável em qualquer banco.</p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black; width: 25%\" colspan=\"2\">"
        bankSlip += "<label  style=\"font-size: 9px;\">Data de vencimento</label><br></br>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + dueDate + "</p>"
        bankSlip += "</td>"
        bankSlip += "</tr>"

        bankSlip += "<tr style=\"line-height: 0.2;  height: 30px;\">"
        bankSlip += "<td style= \"border: 1px solid black; width: 75%;\"  colspan=\"5\">"
        bankSlip += "<label style=\"font-size: 9px;\">Nome do Beneficiário/CNPJ/CPF</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + beneficiaryName + "/" + beneficiaryCnpjString + "</p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black; width: 25%\"  colspan=\"2\">"
        bankSlip += "<label style=\"font-size: 9px;\">AGÊNCIA/CÓDIGO BENEFICIÁRIO</label> "
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + beneficiaryAgency + "/" + bankAccountNumber + "</p>"
        bankSlip += "</td>"
        bankSlip += "</tr>"

        bankSlip += "<tr style=\"line-height: 0.2;  height: 30px;\">"
        bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
        bankSlip += "<label style=\"font-size: 9px;\">Data do Documento</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + invoiceDate + "</p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black;\" colspan=\"1\" class=\"col-10\">"
        bankSlip += "<label style=\"font-size: 9px;\">Número do Documento</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"> NFE: " + invoiceNumber + "</p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
        bankSlip += "<label  style=\"font-size: 9px;\">Espécie Documento</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + kindDocument + "</p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
        bankSlip += "<label style=\"font-size: 9px;\">Aceite</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + bankSlipAcceptance + "</p>"
        bankSlip += "</td>"
        bankSlip += "<td  style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\" >"
        bankSlip += "<label style=\"font-size: 9px;\">Data Processamento</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + processingDate + "</p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black; width: 25%\"  colspan=\"1\" >"
        bankSlip += "<label style=\"font-size: 9px;\">Nosso Número</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + ourBankSlipNumber + "</p>"
        bankSlip += "</td>"
        bankSlip += "</tr>"

        bankSlip += "<tr style=\"line-height: 0.2; height: 30px;\">"
        bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
        bankSlip += "<label style=\"font-size: 9px;\">Uso do Banco</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"><br></p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
        bankSlip += "<label style=\"font-size: 9px;\">Carteira</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + billingWallet + "</p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
        bankSlip += "<label style=\"font-size: 9px;\">Espécie Moeda</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">R$</p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
        bankSlip += "<label style=\"font-size: 9px;\">Quantidade de Moeda</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"><br>  </p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black;\"  colspan=\"1\" class=\"col-10\">"
        bankSlip += "<label style=\"font-size: 9px;\">X Valor</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"><br> </p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black; width: 25%\"  colspan=\"1\">"
        bankSlip += "<label style=\"font-size: 9px;\">Valor do Documento</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">R$" + realBR + "</p>"
        bankSlip += "</td></tr>"

        bankSlip += "<tr style=\"line-height: 0.2;  height: 30px;\">"
        bankSlip += "<td style= \"border: 1px solid black; width: 75%;\"  colspan=\"5\">"
        bankSlip += "<label style=\"font-size: 9px;\">Informações de Responsabilidade do Beneficiário</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + installment + "</p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black; width: 25%\"  colspan=\"2\">"
        bankSlip += "<label style=\"font-size: 9px;\">Desconto/Abatimento</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">R$ </p>"
        bankSlip += "</td></tr>"

        bankSlip += "<tr style=\"line-height: 0.2;  height: 30px;\">"
        bankSlip += "<td style= \"border: 1px solid black; width: 75%;\"  colspan=\"5\" >"
        bankSlip += "<label style=\"font-size: 9px;\">Informações de Responsabilidade do Beneficiário</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"><br></p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black; width: 25%\" colspan=\"2\">"
        bankSlip += "<label style=\"font-size: 9px;\">Juros/Multa: </label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + interestRate + "% a.m. </p>"
        bankSlip += "</td></tr>"

        bankSlip += "<tr style=\"line-height: 0.2;  height: 30px;\">"
        bankSlip += "<td style= \"border: 1px solid black; width: 75%;\"  colspan=\"5\">"
        bankSlip += "<label style=\"font-size: 9px;\">Informações de Responsabilidade do Beneficiário</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"><br></p>"
        bankSlip += "</td>"
        bankSlip += "<td style= \"border: 1px solid black; width: 25%\"  colspan=\"2\">"
        bankSlip += "<label style=\"font-size: 9px;\">Valor Cobrado</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">R$</p>"
        bankSlip += "</td></tr>"

        bankSlip += "<tr style=\"line-height: 0.2;  height: 70px;\">"
        bankSlip += "<td style= \"border: 1px solid black; width: 100%;\" colspan=\"6\" >"
        bankSlip += "<label style=\"font-size: 9px;\">Nome do Pagador/CNPJ/CPF/Endereço</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + payerName + " - " + payerCnpjString + "</p>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + payerStreet + " - " + payerNeighborhood + "</p>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\">" + payerCity + " - " + payerUf + " - " + payerZipCode + "</p>"
        bankSlip += "</td></tr>"

        bankSlip += "<tr style=\"line-height: 0.2; height: 10px;\">"
        bankSlip += "<td style= \"border: 1px solid black; line-height: 250%; line-height: 0.2;\"  colspan=\"6\">"
        bankSlip += "<label style=\"font-size: 9px;\">Código de Barras</label>"
        bankSlip += "<p style= \"font-family: Arial, Helvetica, sans-serif; font-size: 15px; font-weight: bold;\"> <br></p>"
        bankSlip += "<barcode codetype=\"code128\" showtext=\"'" + digitableLine.toString() + "'\"/>" //*atenção ao barcode

        //* bankSlip += "<barcode codetype=\"code128\" showtext=\"false\" height=\"15px\" width=\"420px\" value=\"" + barsCode + "\"/>" //*atenção ao barcode
        bankSlip += "<svg id=\"barcode\" ></svg>"
        bankSlip += "<script>"
        bankSlip += "JsBarcode(\"#barcode\",'" + digitableLine.toString() + "', {"
        bankSlip += "format: \"CODE128\" ,"
        bankSlip += "displayValue: true,"
        bankSlip += "fontSize: 15,"
        bankSlip += "margin: 15"
        bankSlip += "})"
        bankSlip += "</script >"
        bankSlip += "</td></tr>"

        bankSlip += "</table>"
        bankSlip += "</div></body>"
        bankSlip += "</html>"


        const bankSlipObj = file.create({
            name: ourBankSlipNumber.toString() + '.html',
            fileType: file.Type.HTMLDOC,
            contents: bankSlip,
            description: 'Boleto bancário',
            folder: 17
        })
        bankSlipObj.save()


        const senderId = -5
        const emails = 'rogerio.rodrigues@dkcloud.com.br'
        const subject = 'HTML CRIADO BOLETO TESTE.' + ' - > NOSSO NÚMERO: ' + ourBankSlipNumber + '.'

        log.debug({
            title: 'linha 613 --> function bankSlipHTML',
            details: bankSlipObj
        })

        

    } 
    catch (error) {
        log.debug({
            title: 'linha 628 - function bankSlipHTML',
            details: 'O ERRO É:   ' + error.message
        })
    }

} //* Fim da function bankSlipHTML()

const  formattedDigitableLine = (digitableLine) =>{


    var concatDigitableLine
    var linhaDigitavel = digitableLine

    log.debug({
        title: ' linha 754 - function formattedDigitableLine',
        details: 'valor da linha digitável = ' + linhaDigitavel
    })

    const field_1_1 = linhaDigitavel.substr(0, 5)
    const field_1_2 = linhaDigitavel.substr(5, 5)
    const field_2_1 = linhaDigitavel.substr(10, 5)
    const field_2_2 = linhaDigitavel.substr(15, 6)
    const field_3_1 = linhaDigitavel.substr(21, 5)
    const field_3_2 = linhaDigitavel.substr(26, 6)
    const field_4 = linhaDigitavel.substr(32, 1)
    const field_5 = linhaDigitavel.substring(33)

    concatDigitableLine = field_1_1 + '.' + field_1_2 + ' ' + field_2_1 + '.' + field_2_2 + ' ' + field_3_1 + '.' + field_3_2
        + ' ' + field_4 + ' ' + field_5

    log.debug({
        title: ' linha 771 - function formattedDigitableLine',
        details: 'Linha digitável formatada = ' + concatDigitableLine
    })

    return concatDigitableLine

} //* function formattedDigitableLine()

const formatCNPJ = (cnpj) => {

    var cnpjStr = cnpj.toString()
    const cnpjSize = cnpjStr.length
    if (cnpjSize == 13) {

        cnpjStr = '0' + cnpjStr
    }

    return cnpjStr
} //*  function formatCNPJ

const formatBRL =(valor) =>  {

    const real = valor
    return format.format({ value: real, type: format.Type.FLOAT })
}