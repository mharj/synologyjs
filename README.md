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
  { "device": "md0",
    "status": "active",
    "type": "raid1",
    "partitions": [
      { "disk": "sda1", "number": "0" },
      { "disk": "sdb1", "number": "1" },
      { "disk": "sdc1", "number": "2" },
      { "disk": "sdd1", "number": "3" },
      { "disk": "sde1", "number": "4" }
    ],
    "action": "resync",
    "progress": "72.2%"
  },
  { "device": "md1",
    "status": "active",
    "type": "raid1",
    "partitions": [
      { "disk": "sda2", "number": "0" },
      { "disk": "sdb2", "number": "1" },
      { "disk": "sdc2", "number": "2" },
      { "disk": "sdd2", "number": "3" },
      { "disk": "sde2", "number": "4" }
    ],
    "action": "recovery",
    "progress": "0.4%"
  },
  { "device": "md2",
    "status": "active",
    "type": "raid5",
    "partitions": [
      { "disk": "sda5", "number": "0" },
      { "disk": "sde5", "number": "4" },
      { "disk": "sdd5", "number": "3" },
      { "disk": "sdc5", "number": "2" },
      { "disk": "sdb5", "number": "1" }
    ],
    "action": "check",
    "progress": "0.2%"
  },
  { "device": "md9",
    "status": "active",
    "type": "raid5",
    "partitions": [
      { "disk": "sdh1", "number": "5", "isSpare": true },
      { "disk": "sdg1", "number": "4" },
      { "disk": "sdf1", "number": "3" },
      { "disk": "sde1", "number": "2" },
      { "disk": "sdd1", "number": "1" },
      { "disk": "sdc1", "number": "0" }
    ]
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
