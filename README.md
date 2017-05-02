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
[ { device: 'md0',
    status: 'active',
    type: 'raid1',
    partitions:
     [ { disk: 'sda1', idx: 0 },
       { disk: 'sdb1', idx: 1 },
       { disk: 'sdc1', idx: 2 },
       { disk: 'sdd1', idx: 3 },
       { disk: 'sde1', idx: 4 } ],
    action: 'resync',
    progress: '72.2%' },
  { device: 'md1',
    status: 'active',
    type: 'raid1',
    partitions:
     [ { disk: 'sda2', idx: 0 },
       { disk: 'sdb2', idx: 1 },
       { disk: 'sdc2', idx: 2 },
       { disk: 'sdd2', idx: 3 },
       { disk: 'sde2', idx: 4 } ],
    action: 'recovery',
    progress: '0.4%' },
  { device: 'md2',
    status: 'active',
    type: 'raid5',
    partitions:
     [ { disk: 'sda5', idx: 0 },
       { disk: 'sdb5', idx: 1 },
       { disk: 'sdc5', idx: 2 },
       { disk: 'sdd5', idx: 3 },
       { disk: 'sde5', idx: 4 } ],
    action: 'check',
    progress: '0.2%' },
  { device: 'md9',
    status: 'active',
    type: 'raid5',
    partitions:
     [ { disk: 'sdc1', idx: 0 },
       { disk: 'sdd1', idx: 1 },
       { disk: 'sde1', idx: 2 },
       { disk: 'sdf1', idx: 3 },
       { disk: 'sdg1', idx: 4 },
       { disk: 'sdh1', idx: 5, isSpare: true } ] } ]
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

## Simple expressjs test setup
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
