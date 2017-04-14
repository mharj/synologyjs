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

## Simple expressjs setup
```javascript
const Synology = require('synologyjs');
const synology = new Synology({host: 'synology',username: 'root',privateKey: './synology'});
const express = require('express');
const app = express();
app.use(express.static('static'));
app.get('/list', function (req, res) {
	synology.getMdStatus()
		.then(function(data){
			res.end(JSON.stringify(data));
		});
});
app.post('/check/:deviceId', function (req, res) {
	if ( req.params.deviceId ) {
		synology.checkMd(req.params.deviceId)
			.then(function(data){
				res.end(JSON.stringify(data));
			})
			.catch(function(err){
				res.status(400).send(err.message);
				res.end();
			});
	} else {
		res.end();
	}
});
app.listen(8080, function () {
  console.log('app listening on port 8080!');
});
```
