// BeyondTrust Secure Remote Access functions
// Remote Support and Privileged Remote Access
import {
    logger
} from '@sailpoint/connector-sdk'

// =================================================
// Authentication 
// =================================================
export async function sra_auth(authUrl:any, client_id:any, client_secret:any) {

    // set the Authorization header
let base64data = Buffer.from(client_id+':'+client_secret).toString('base64')
const authorization = 'Basic '+base64data

const axios = require('axios');
const qs = require('querystring');
const data = {
    grant_type: 'client_credentials'
};
// set the headers
const config = {
    method: 'post',
    rejectUnauthorized: false,
    url: authUrl,
    data: qs.stringify(data),
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authorization
    }
};
let res = await axios(config)
return res

}

// =================================================
// GET all Users 
// =================================================
export async function sra_GET_accounts(instance:any, token:any) {

const axios = require('axios');
const qs = require('querystring');

// set the headers
const config = {
    method: 'get',
    rejectUnauthorized: false,
    url: instance + '/api/config/v1/user',
    headers: {
        'Accept': 'application/json',
        'Authorization': token
    }
};
let res = await axios(config)


return res

}

// =================================================
// GET Security Providers
// =================================================
export async function sra_GET_security_providers(instance:any, token:any) {

    const axios = require('axios');
    const qs = require('querystring');

    const configGP = {
        method: 'get',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/security-provider',
        headers: {
            'Accept': 'application/json',
            'Authorization': token
        }
    };
    let resSP = await axios(configGP)



    return resSP

    }

// =================================================
// GET a User 
// =================================================
export async function sra_GET_account(instance:any, token:any, id:any) {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'get',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/user/'+id,
        headers: {
            'Accept': 'application/json',
            'Authorization': token
        }
    };
    let res = await axios(config)
    return res
    
    }

// =================================================
// GET a User id by username - NOT USED
// =================================================
export async function sra_GET_account_nameToId(instance:any, token:any, identity:any) {

    const axios = require('axios');
    const qs = require('querystring');
    
    // set the headers
    const config = {
        method: 'get',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/user',
        headers: {
            'Accept': 'application/json',
            'Authorization': token
        }
    };
    let users = await axios(config)
    let user_id = ''
    users.data.forEach((element: { username: any; id: string; }) => {
        if(element.username == identity){user_id = element.id}
    })

    return user_id
    
    }

// =================================================
// GET a User Group Policy memberships
// =================================================
export async function sra_GET_account_groups(instance:any, token:any, identity:any, GPs:any) {

    const axios = require('axios');
    const qs = require('querystring');
    const arrRet = []
//    arrRet.push("fakeGroupPolicy0")

    // GET Group Policies for User
    for (let indexGP = 0; indexGP < GPs.length && (indexGP) < GPs.length; ++indexGP) {
  // GET GroupPolicy for member       
  const configGPmbr = {
    method: 'get',
    rejectUnauthorized: false,
    url: instance + '/api/config/v1/group-policy/'+GPs[indexGP].id+'/member',
    headers: {
        'Accept': 'application/json',
        'Authorization': token
    }
};
let res = await axios(configGPmbr)
for (let index = 0; index < res.data.length && (index) < res.data.length; ++index) {

//        if(res.data[index].user_id == identity){    arrRet.push(GPs[indexGP].id+":"+GPs[indexGP].name) }
        if(res.data[index].user_id == identity){    arrRet.push(GPs[indexGP].id) }
}
}
 
    return arrRet
//      return GPs.length

    }

// =================================================
// GET a User Group Policy memberships table
// =================================================
export async function sra_GET_account_groups_table(instance:any, token:any, GPs:any) {

    const axios = require('axios');
    const qs = require('querystring');

    // GET Security Providers
 //   let SPs = await sra_GET_security_providers(instance, token)

    // Iterate Group Policies
    let GPTable = []
    for (let indexGP = 0; indexGP < GPs.length && (indexGP) < GPs.length; ++indexGP) {
  // GET GroupPolicy for member       
  const configGPmbr = {
    method: 'get',
    rejectUnauthorized: false,
    url: instance + '/api/config/v1/group-policy/'+GPs[indexGP].id+'/member',
    headers: {
        'Accept': 'application/json',
        'Authorization': token
    }
};
let GPmbrs = await axios(configGPmbr)
for (let index = 0; index < GPmbrs.data.length && (index) < GPmbrs.data.length; ++index) {

      if(GPmbrs.data[index].user_id){
//        let security_provider_name = ''
//        for (let indexSPs = 0; indexSPs < SPs.data.length && (indexSPs) < SPs.data.length; ++indexSPs) {
//            logger.info('indexSPs = '+indexSPs+'   SP_id = '+SPs.data[indexSPs].id+'   sp_id = '+GPmbrs.data[index].security_provider_id)
//            if(SPs.data[indexSPs].id == GPmbrs.data[index].security_provider_id){security_provider_name = SPs.data[indexSPs].name}
//        }
//        logger.info('security_provider_id = '+GPmbrs.data[index].security_provider_id+'    security_provider_name = '+security_provider_name)
        GPTable.push({"GPmbrid":GPmbrs.data[index].user_id,"security_provider_id":GPmbrs.data[index].security_provider_id,"GP_id":GPs[indexGP].id,"GP_name":GPs[indexGP].name})
      }
}
}
 
    return GPTable

    }

// =================================================
// GET a User Group Policy memberships with table
// =================================================
export async function sra_GET_account_groups_with_table(identity:any, GPTable:any) {

    const axios = require('axios');
    const qs = require('querystring');
 
    // Iterate Group Policy Table
    let GPs = []
    for (let indexGPTable = 0; indexGPTable < GPTable.length && (indexGPTable) < GPTable.length; ++indexGPTable) {
  // GET Group Policy memberships for user_id       
      if(GPTable[indexGPTable].GPmbrid == identity){
        GPs.push(GPTable[indexGPTable].GP_id+':'+GPTable[indexGPTable].GP_name)
      }
}
 
    return GPs

    }

// =================================================
// GET Group Policies
// =================================================
export async function sra_GET_group_policies(instance:any, token:any) {

    const axios = require('axios');
    const qs = require('querystring');

    const configGP = {
        method: 'get',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/group-policy',
        headers: {
            'Accept': 'application/json',
            'Authorization': token
        }
    };
    let resGP = await axios(configGP)
      return resGP

    }

// =================================================
// GET Group Policy
// =================================================
export async function sra_GET_group_policy(instance:any, token:any, id:any) {

    const axios = require('axios');
    const qs = require('querystring');

    const gpid = id.split(":")[0]

    const configGP = {
        method: 'get',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/group-policy/'+gpid,
        headers: {
            'Accept': 'application/json',
            'Authorization': token
        }
    };
    let resGP = await axios(configGP)
      return resGP

    }
    
// =================================================
// Create a User with entitlements
// =================================================
export async function sra_create_account_ent(instance:any,remoteSupport:any, token:any, identity:any) {

    const axios = require('axios');
    const qs = require('querystring');

    let resA = await sra_GET_account(instance,token,"1")

    let data = {}
    if(!(resA.data.private_display_name)){
    data = {
        "username": identity.username,
        "public_display_name": identity.public_display_name,
        "email_address": identity.email_address,
        "enabled": true,
        "password": identity.password
    }
}
if(resA.data.private_display_name){
    data = {
        "username": identity.username,
        "public_display_name": identity.public_display_name,
        "private_display_name": identity.private_display_name,
        "email_address": identity.email_address,
        "enabled": true,
        "password": identity.password
    }
}

    // set the headers
    const config = {
        method: 'post',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/user',
        data: data,
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token
        }
    };
    let res = await axios(config)
    logger.info(`res from Create Account res.data`)
    logger.info(`res from Create Account ${JSON.stringify(res.data)}`)
    logger.info(`res.data.id from Create Account ${res.data.id.toString()}`)

    // entitlements = Group Policies
    let ret = {}
    if (identity.entitlementsX){
    const entSize = identity.entitlements.length
    var gpid
    for (let Index = 0; Index < entSize; ++Index) {
    gpid = parseInt(identity.entitlements[Index].split(":")[0])
    const ent = {"security_provider_id":1,"user_id":res.data.id}
    logger.info(`sra-functions add ent done`)

    // set the headers
    const config_ent = {
        method: 'post',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/group-policy/'+gpid+'/member',
        data: ent,
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token
        }
    };
    let resA = await axios(config_ent)
    }
    ret = {
        "id": res.data.id.toString(),
        "username": identity.username,
        "public_display_name": identity.public_display_name,
        "email_address": identity.email_address,
        "enabled": true,
        "password": identity.password,
        "groups": identity.entitlements
    }
}


if (identity.groups){
    logger.info('identity.groups = '+identity.groups[0])
//    const entSize = identity.groups.length
//    var gpid = '2'
//    for (let Index = 0; Index < entSize; ++Index) {
//    gpid = parseInt(identity.groups[Index].split(":")[0])
    const gpid = identity.groups[0].split(":")[0]
//    gpid = identity.groups
    const ent = {"security_provider_id":1,"user_id":res.data.id}
    logger.info(`sra-functions add ent done`)

    // set the headers
    const config_ent = {
        method: 'post',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/group-policy/'+gpid+'/member',
        data: ent,
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token
        }
    };
    let resE = await axios(config_ent)
    logger.info(`resE for Add Entitlement: ${JSON.stringify(resE.data)}`)
    ret = {
        "id": res.data.id.toString(),
        "username": res.data.username,
        "public_display_name": res.data.public_display_name,
        "private_display_name": res.data.private_display_name,
        "email_address": res.data.email_address,
        "preferred_email_language": res.data.preferred_email_language,
        "security_provider_id": res.data.security_provider_id,
        "two_factor_required": res.data.two_factor_required,
        "enabled": res.data.enabled,
        "groups": identity.groups
    }
}


    logger.info(`sra-functions ret ready for return: ${ret}`)
    return ret
    
    }
// =================================================
// Create a User no entitlements
// =================================================
export async function sra_create_account(instance:any,remoteSupport:any, token:any, identity:any) {

    const axios = require('axios');
    const qs = require('querystring');

    let resA = await sra_GET_account(instance,token,"1")


    let data = {}
    if(!(resA.data.private_display_name)){
    data = {
        "username": identity.username,
        "public_display_name": identity.public_display_name,
        "email_address": identity.email_address,
        "enabled": true,
        "password": identity.password
    }
}
if(resA.data.private_display_name){
    data = {
        "username": identity.username,
        "public_display_name": identity.public_display_name,
        "private_display_name": identity.private_display_name,
        "email_address": identity.email_address,
        "enabled": true,
        "password": identity.password
    }
}

    // set the headers
    const config = {
        method: 'post',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/user',
        data: data,
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token
        }
    };
    let res = await axios(config)
    logger.info(`res from Create Account res.data`)
//    logger.info(`res from Create Account ${JSON.stringify(res.data)}`)
    logger.info(`res.data.id from Create Account ${res.data.id.toString()}`)

    return res.data
    
    }

// =================================================
// Change a User 
// =================================================
export async function sra_change_account(instance:any, token:any, account:any, change:any) {

    const axios = require('axios');
    const qs = require('querystring');

    // entitlements = Group Policies    
    //if (change.attribute == "entitlements"){
    if (change.attribute){
        const gpid = change.value.split(":")[0]
//        const gpid = change.value
    let config_ent = {}
    let member_id = {}

    //Remove User from Group Policy
    if (change.op == "Remove" || change.op == "remove"){
        //Get Member ID via Group Policy Query
        member_id = {
            method: 'get',
            rejectUnauthorized: false,
            url: instance + '/api/config/v1/group-policy/'+gpid+'/member',
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            }
        }
        let resM = await axios(member_id)
        let mbr_id = 0
        resM.data.forEach((element: { user_id: number; id: number; security_provider_id: number }) => {
            logger.info(`Remove Group Policy.  element.user_id = `+element.user_id+'   account = '+account)
            if(element.user_id == account){mbr_id = element.id}
        })
        logger.info(`Remove Group Policy.  mbr_id = `+mbr_id)
        //Use mbr_id to remove User from Group Policy
        config_ent = {
            method: 'delete',
            rejectUnauthorized: false,
            url: instance + '/api/config/v1/group-policy/'+gpid+'/member/'+mbr_id,
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            }
        }
       }
    //Add User to Group Policy
    if (change.op == "Add" || change.op == "add"){
        config_ent = {
            method: 'post',
            rejectUnauthorized: false,
            url: instance + '/api/config/v1/group-policy/'+gpid+'/member',
            data: {"security_provider_id":1,"user_id":parseInt(account)},
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            }
        }
       }


       let resA = await axios(config_ent)

       return {}


}
    
    }
    
// =================================================
// Change a User Status
// =================================================
export async function sra_change_account_status(instance:any, token:any, account:any, change:any) {

    const axios = require('axios');
    const qs = require('querystring');

    // Disable Account    
if (change == "disable"){

        const status = {
            method: 'patch',
            rejectUnauthorized: false,
            url: instance + '/api/config/v1/user/'+parseInt(account),
            data: {"enabled": false},
            headers: {
                'Content-type': 'application/json',
                'Accept': 'application/json',
                'Authorization': token
            }
      
    }
    let res = await axios(status)
    return res
}

if (change == "enable"){

    const status = {
        method: 'patch',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/user/'+parseInt(account),
        data: {"enabled": true},
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token
        }
  
}
let res = await axios(status)
return res
}

if (change == "unlock"){

    const status = {
        method: 'patch',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/user/'+parseInt(account),
        data: {"failed_logins": 0},
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token
        }
  
}
let res = await axios(status)
return res
}

if (change == "delete"){

    const status = {
        method: 'delete',
        rejectUnauthorized: false,
        url: instance + '/api/config/v1/user/'+parseInt(account),
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token
        }
  
}
let res = await axios(status)
return res
}

}