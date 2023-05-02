<!DOCTYPE html>
<html>
<body>

<h1># idn_beyondtrust_representatives</h1>

<p>SailPoint IdentityNow SaaS Connector SDK - Remote Support and Privileged Remote Access</p>

  The BeyondTrust Representatives connector capabilities are managed within connector-spec.json.

  <img src="images/connector-spec.png" alt="connector-spec.json">
  
  The capability list is used by the IdentityNow instance.  The account and entitlement schemas, and the provisioning policy for new accounts created in SRA, are also included in connector-spec.json.
  
  src/index.ts leverages tools/util.ts to render responses back to IdentityNow connector.  We also need to determine if the connector is used against PRA or RS, by looking at the presence of the private_display_name attribute specific to Remote Support, and absent in PRA.

  <img src="images/index.png" alt="index.ts">


src/tools/util.ts includes functions specific to either PRA or Remote Support.

  <img src="images/util.png" alt="util.ts">
  
src/tools/util.ts leverage model/user.ts and /model/group.ts
  
  <img src="images/user.png" alt="user.ts">

  <img src="images/group.png" alt="group.ts">

/src/my-client.ts is called by index.ts for each capability.  Each capability start with a test for the Bearer Token, to determine if it is expired or undefined and require re-authentication.
  
   <img src="images/checkExpiration.png" alt="my-client.ts">
  
Global Variables are used to store the Bearer Token, so as long as the Connector is running, we can reuse the Bearer Token from previous calls, if it is not expired.
  
  <img src="images/globalVariables.png" alt="my-client.ts">

We also need to catch Unauthorized 401 error, which means the Bearer Token we have in Global Variables is invalid despite having a calculated Expiration Time in the future.  This condition can be triggered by changing the instance in configuration after having obtained a Bearer Token from another instance.
  
  <img src="images/catch401.png" alt="my-client.ts">
  
  Functions specific to SRA are located in /src/sra-functions.ts.
  
  This is the Authentication function leveraging Global Variables to make the Bearer Token and calculated Expiration Time available globally.
  
  <img src="images/function-auth.png" alt="sra-functions.ts">
  
  This is the GET User function:
  
  <img src="images/function-user.png" alt="sra-functions.ts">
  
  And this is the function that provides a User with details:
  
  <img src="images/function-userDetails.png" alt="sra-functions.ts">
  
  <p>Load Testing 8-2000 users</p>

  Test data was used to test Aggregation for up to 2000 users in SRA.  Each user is a member of 1 of 3 Group Policies.
  
  <img src="images/Aggregation_Time.png" alt="Aggregation Time">

  <img src="images/AccountsAggregation-15.png" alt="15 users">
  
  <img src="images/AccountsAggregation-102.png" alt="102 users">
  
  <img src="images/AccountsAggregation-500-1.png" alt="500 users">
  
  <img src="images/AccountsAggregation-1000-1.png" alt="1000 users">

  
  <img src="images/AccountsAggregation-2000-1.png" alt="2000 users">



</body>
</html>
