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
[ 
  { device: 'md0',
    status: 'active',
    type: 'raid1',
    partitions: [ 'sda1[0]', 'sdb1[1]', 'sdc1[2]', 'sdd1[3]', 'sde1[4]' ],
    action: 'check',
    progress: '34.1%'
  },
  { device: 'md1',
    status: 'active',
    type: 'raid1',
    partitions: [ 'sda2[0]', 'sdb2[1]', 'sdc2[2]', 'sdd2[3]', 'sde2[4]' ] 
  },
  { device: 'md2',
    status: 'active',
    type: 'raid5',
    partitions: [ 'sda5[0]', 'sde5[4]', 'sdd5[3]', 'sdc5[2]', 'sdb5[1]' ] 
  } 
]
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

```javascript
{
  action: 'check',
  progress: '34.1%' 
}
```
