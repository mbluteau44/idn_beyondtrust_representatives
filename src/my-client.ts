import { ConnectorError, logger } from "@sailpoint/connector-sdk"
import {sra_auth, sra_GET_accounts, sra_GET_account, sra_GET_group_policies, sra_GET_account_groups,sra_create_account,sra_change_account,sra_change_account_status,sra_create_account_ent,sra_GET_account_groups_table,sra_GET_account_groups_with_table,sra_GET_security_providers,sra_GET_group_policy,sra_GET_account_details,sra_GET_accounts_details} from './sra-functions'


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

        let resAccounts = await sra_GET_accounts_details(this.instance,"Bearer "+resAuth.data.access_token)

        return resAccounts
    }

    async getAccount(identity: string): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)
        let account = await sra_GET_account(this.instance,"Bearer "+resAuth.data.access_token,identity)
        let resAccount = await sra_GET_account_details(this.instance,"Bearer "+resAuth.data.access_token,account.data)

        return resAccount
    }

    async createAccount(account: string): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)
        let createAccount: any = await sra_create_account_ent(this.instance,this.remoteSupport,"Bearer "+resAuth.data.access_token,account)

        let resAccount = await sra_GET_account_details(this.instance,"Bearer "+resAuth.data.access_token,createAccount)
        return resAccount
    }

    async changeAccount(account: string, change: any): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)
        let changeAccount = await sra_change_account(this.instance,"Bearer "+resAuth.data.access_token,account,change)

        let getAccount = await sra_GET_account(this.instance,"Bearer "+resAuth.data.access_token,account)
        let resAccount = await sra_GET_account_details(this.instance,"Bearer "+resAuth.data.access_token,getAccount.data)
        return resAccount
    }

    async changeAccountStatus(account: string, change: any): Promise<any> {
        // In a real use case, this requires a HTTP call out to SaaS app to fetch an account,
        // which is why it's good practice for this to be async and return a promise.
        let resAuth = await sra_auth(this.authUrl,this.client_id,this.client_secret)
        let changeAccount = await sra_change_account_status(this.instance,"Bearer "+resAuth.data.access_token,account,change)
        let resAccount = await sra_GET_account_details(this.instance,"Bearer "+resAuth.data.access_token,changeAccount.data)
        return resAccount
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
