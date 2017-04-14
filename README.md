# synologyjs
Simple Synology md info query and raid check action via node-ssh module

```
npm install mharj/synologyjs --save
```

```javascript
const Synology = require('synologyjs');
const synology = new Synology({host: 'synology',username: 'root',privateKey: './synology'});

synology.getMdStatus()
  .then(function(data){
    console.log(data);
  });
```

```javascript
const Synology = require('synologyjs');
const synology = new Synology({host: 'synology',username: 'root',privateKey: './synology'});

synology.checkMd('md0')
  .then(function(data){
    console.log(data);
  })
  .catch(function(err){
    console.log(err);
  });
```
