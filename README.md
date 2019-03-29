# JS-OSCH-SDK
OSCH Coast API服务器集成并提交OSCH事务。它有两个主要用途：查询Coast以及构建，签署和向OSCH网络提交事务。  
JS-OSCH-SDK是一个用于与OSCH Coast服务器通信的Javascript库。JS-OSCH-SDK使您可以访问Coast公开的所有端点。 它用于在Node或浏览器中构建OSCH应用程序。  

它提供：
* Coast端点的网络层API
* 用于构建和签署事务，与OSCH Coast实例通信以及提交事务或查询网络历史记录的工具

## 快速开始
使用npm在您自己的项目中包含JS-OSCH-SDK：

```shell
npm install --save osch-sdk
```

对于浏览器，请使用Bower安装JS-OSCH-SDK。它导出一个变量OschSdk。以下示例假设您osch-sdk.js 与html文件相关。

```html
< script  src = “ osch-sdk.js” > </ script >   
< script > console.log(OschSdk); </ script > 
```

## 查询Coast
JS-OSCH-SDK使您可以访问Coast公开的所有端点，如下：  
http://coast.oschain.io  
http://coast.myoschain.com  
## 建立请求
JS-OSCH-SDK使用Builder模式创建发送到Coast的请求。从服务器对象开始，您可以将方法链接在一起以生成查询。（有关可能的方法，请参阅Coast参考文档。）  
### 基本查询  

```js
const OschSdk = require('osch-sdk');
const server = new OschSdk.Server('http://coast.oschain.io/');
//查询最近账本交易
server.transactions()  
    .forLedger(1400)  
    .call().then(function(r){ console.log(r); });  
//查询账户下的transaction
server.transactions()     
    .forAccount('GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW')  
    .call().then(function(r){ console.log(r); }); 
```  
 
### 创建一个账户  

```js
const OschSdk = require('osch-sdk');
const server = new OschSdk.Server('http://coast.oschain.io/');
const source = OschSdk.Keypair.fromSecret('SA3W53XXG64ITFFIYQSBIJDG26LMXYRIMEVMNQMFAQJOYCZACCYBA34L')
const destination = OschSdk.Keypair.random()

OschSdk.Network.use(new OschSdk.Network("osch public network"));

server.accounts()
  .accountId(source.publicKey())
  .call()
  .then(({ sequence }) => {
    const account = new OschSdk.Account(source.publicKey(), sequence)
    const transaction = new OschSdk.TransactionBuilder(account, {
      fee: "100000000"
    })
      .addOperation(OschSdk.Operation.createAccount({
        destination: destination.publicKey(),
        startingBalance: '25'
      }))
      .build()
    transaction.sign(OschSdk.Keypair.fromSecret(source.secret()))
    return server.submitTransaction(transaction)
  })
  .then(results => {
    console.log('Transaction', results._links.transaction.href)
    console.log('New Keypair', destination.publicKey(), destination.secret())
  })
```