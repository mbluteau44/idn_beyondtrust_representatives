import { ConnectorError, logger } from "@sailpoint/connector-sdk"
import {sra_auth, sra_GET_accounts, sra_GET_account, sra_GET_group_policies, sra_GET_account_groups,sra_create_account,sra_change_account,sra_change_account_status,sra_create_account_ent,sra_GET_account_groups_table,sra_GET_account_groups_with_table,sra_GET_security_providers,sra_GET_group_policy} from './sra-functions'


export class MyClient {
    private readonly instance?: string
    private readonly authUrl?: string
    private readonly client_id?: string
    private readonly client_secret?: string
    private readonly remoteSupport?: string
//    private readonly token?: string
//    private readonly identity?: string

    constructor(config: any) {
        // Fetch necessary properties from config.
        // Following properties actually do not exist in the config -- it just serves as an example.
        this.instance = config?.instance
        this.authUrl = config?.authUrl
        this.client_id = config?.client_id
        this.client_secret = config?.client_secret
        this.remoteSupport = config?.remoteSupport
    }

    // Retrieve Remote Support checkbox from Connector config(true or false).  Currently not being used in code.
    async getProduct(): Promise<any> {

        return this.remoteSupport
    }


    async getAllAccounts(): Promise<any[]> {
        let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)

        let resAccounts = await sra_GET_accounts(this.instance,"Bearer "+resAuth.data.access_token)

        let resGP = await sra_GET_group_policies(this.instance,"Bearer "+resAuth.data.access_token)

        let GPTable = await sra_GET_account_groups_table(this.instance,"Bearer "+resAuth.data.access_token,resGP.data)
        logger.info('GPTable : '+JSON.stringify(GPTable))

    // GET Security Providers
    let SPs = await sra_GET_security_providers(this.instance,"Bearer "+resAuth.data.access_token)
    logger.info('SPs.data.length = '+SPs.data.length)

        logger.info('getAllAccounts remoteSupport = '+this.remoteSupport)
        const ret = []

        for (let index = 0; index < resAccounts.data.length && (index) < resAccounts.data.length; ++index) {
            let GroupMemberships = await sra_GET_account_groups_with_table(resAccounts.data[index].id,GPTable)
            let spname = ''
            for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
                if(SPs.data[indexSP].id == resAccounts.data[index].security_provider_id){spname = SPs.data[indexSP].name}
            }

            let user = {}
            user = { 
                id: resAccounts.data[index].id.toString(),
                username: resAccounts.data[index].username,
                email_address: resAccounts.data[index].email_address,
                enabled: resAccounts.data[index].enabled,
                preferred_email_language: resAccounts.data[index].preferred_email_language,
                public_display_name: resAccounts.data[index].public_display_name,
                private_display_name: resAccounts.data[index].private_display_name,
                failed_logins: resAccounts.data[index].failed_logins,
                two_factor_required: resAccounts.data[index].two_factor_required,
                security_provider_id: resAccounts.data[index].security_provider_id,
                security_provider_name: spname,
                groups: GroupMemberships
            }
            ret.push(user)
        }       

        return ret
    }

    async getAccount(identity: string): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)

        let resAccount = await sra_GET_account(this.instance,"Bearer "+resAuth.data.access_token,identity)
        let resGP = await sra_GET_group_policies(this.instance,"Bearer "+resAuth.data.access_token)

//        let resC = await sra_GET_account_groups(this.instance,"Bearer "+res.data.access_token,resA.data.id,resB.data)
// GET Group Policy members Table
let GPTable = await sra_GET_account_groups_table(this.instance,"Bearer "+resAuth.data.access_token,resGP.data)
// GET Security Providers
    let SPs = await sra_GET_security_providers(this.instance,"Bearer "+resAuth.data.access_token)
let GroupMemberships = await sra_GET_account_groups_with_table(resAccount.data.id,GPTable)
    let spname = ''
    for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
        if(SPs.data[indexSP].id == resAccount.data.security_provider_id){spname = SPs.data[indexSP].name}
    }

        return { 
                id: resAccount.data.id.toString(),
                username: resAccount.data.username,
                email_address: resAccount.data.email_address,
                enable: resAccount.data.enabled,
                preferred_email_language: resAccount.data.preferred_email_language,
                public_display_name: resAccount.data.public_display_name,
                private_display_name: resAccount.data.private_display_name,
                failed_logins: resAccount.data.failed_logins,
                two_factor_required: resAccount.data.two_factor_required,
                security_provider_id: resAccount.data.security_provider_id,
                security_provider_name: spname,
                groups: GroupMemberships
            }
    }

    async createAccount(account: string): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)

        let resAccount: any = await sra_create_account_ent(this.instance,this.remoteSupport,"Bearer "+resAuth.data.access_token,account)
        logger.info(`myClient resA : ${JSON.stringify(resAccount)}`)
        logger.info(`remoteSupport : ${this.remoteSupport}`)
        let resGP = await sra_GET_group_policies(this.instance,"Bearer "+resAuth.data.access_token)
// GET Group Policy members Table
let GPTable = await sra_GET_account_groups_table(this.instance,"Bearer "+resAuth.data.access_token,resGP.data)
// GET Security Providers
    let SPs = await sra_GET_security_providers(this.instance,"Bearer "+resAuth.data.access_token)
let GroupMemberships = await sra_GET_account_groups_with_table(resAccount.id,GPTable)
    let spname = ''
    for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
        if(SPs.data[indexSP].id == resAccount.security_provider_id){spname = SPs.data[indexSP].name}
    }

        return { 
                id: resAccount.id.toString(),
                username: resAccount.username,
                email_address: resAccount.email_address,
                enable: resAccount.enabled,
                preferred_email_language: resAccount.preferred_email_language,
                public_display_name: resAccount.public_display_name,
                private_display_name: resAccount.private_display_name,
                failed_logins: resAccount.failed_logins,
                two_factor_required: resAccount.two_factor_required,
                security_provider_id: resAccount.security_provider_id,
                security_provider_name: spname,
                groups: GroupMemberships
            }
    }

    async changeAccount(account: string, change: any): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)

//        throw new ConnectorError('Unknown account change op: ' + JSON.stringify(changes))        

//        changes.forEach((c: any) => {
            sra_change_account(this.instance,"Bearer "+resAuth.data.access_token,account,change)
            logger.info(`forEach change : ${JSON.stringify(change)}`)
//        })

        let resGP = await sra_GET_group_policies(this.instance,"Bearer "+resAuth.data.access_token)
// GET Group Policy members Table
let GPTable = await sra_GET_account_groups_table(this.instance,"Bearer "+resAuth.data.access_token,resGP.data)
// GET Security Providers
    let SPs = await sra_GET_security_providers(this.instance,"Bearer "+resAuth.data.access_token)
    let resAccount = await sra_GET_account(this.instance,"Bearer "+resAuth.data.access_token,account)
    let GroupMemberships = await sra_GET_account_groups_with_table(resAccount.data.id,GPTable)
    let spname = ''
    for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
        if(SPs.data[indexSP].id == resAccount.data.security_provider_id){spname = SPs.data[indexSP].name}
    }
        
        return { 
                id: resAccount.data.id.toString(),
                username: resAccount.data.username,
                email_address: resAccount.data.email_address,
                enable: resAccount.data.enabled,
                preferred_email_language: resAccount.data.preferred_email_language,
                public_display_name: resAccount.data.public_display_name,
                private_display_name: resAccount.data.private_display_name,
                failed_logins: resAccount.data.failed_logins,
                two_factor_required: resAccount.data.two_factor_required,
                security_provider_id: resAccount.data.security_provider_id,
                security_provider_name: spname,
                groups: GroupMemberships
            }
    }

    async changeAccountStatus(account: string, change: any): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)
  
        let resGP = await sra_GET_group_policies(this.instance,"Bearer "+resAuth.data.access_token)
// GET Group Policy members Table
let GPTable = await sra_GET_account_groups_table(this.instance,"Bearer "+resAuth.data.access_token,resGP.data)
// GET Security Providers
    let SPs = await sra_GET_security_providers(this.instance,"Bearer "+resAuth.data.access_token)
    let resAccount = await sra_change_account_status(this.instance,"Bearer "+resAuth.data.access_token,account,change)
    let GroupMemberships = await sra_GET_account_groups_with_table(resAccount.data.id,GPTable)
    let spname = ''
    for (let indexSP = 0; indexSP < SPs.data.length && (indexSP) < SPs.data.length; ++indexSP) {
        if(SPs.data[indexSP].id == resAccount.data.security_provider_id){spname = SPs.data[indexSP].name}
    }
        
        return { 
                id: resAccount.data.id.toString(),
                username: resAccount.data.username,
                email_address: resAccount.data.email_address,
                enable: resAccount.data.enabled,
                preferred_email_language: resAccount.data.preferred_email_language,
                public_display_name: resAccount.data.public_display_name,
                private_display_name: resAccount.data.private_display_name,
                failed_logins: resAccount.data.failed_logins,
                two_factor_required: resAccount.data.two_factor_required,
                security_provider_id: resAccount.data.security_provider_id,
                security_provider_name: spname,
                groups: GroupMemberships
            }
    }

    async testConnection(): Promise<any> {

        let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)


logger.info(`resAuth : ${resAuth}`)

return {}
}
async getAllEntitlements(): Promise<any[]> {
    let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)

    let resGP = await sra_GET_group_policies(this.instance,"Bearer "+resAuth.data.access_token)

    return resGP.data

}

async getEntitlement(identity: string): Promise<any[]> {
    let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)

    let resGP = await sra_GET_group_policy(this.instance,"Bearer "+resAuth.data.access_token,identity)

    return resGP.data

}

}
