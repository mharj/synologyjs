# synologyjs

Simple Synology and Linux md info query and raid check action via node-ssh module

```
npm install mharj/synologyjs --save
```

```javascript
const {LinuxMdInfo} = require('synologyjs');
const raid = new LinuxMdInfo({host: 'synology', username: 'root', privateKey: './synology'});

raid.getMdStatus().then(function(data) {
	console.log(data);
});
```

```javascript
[
	{
		device: 'md0',
		status: 'active',
		type: 'raid1',
		partitions: [{disk: 'sda1', idx: 0}, {disk: 'sdb1', idx: 1}, {disk: 'sdc1', idx: 2}, {disk: 'sdd1', idx: 3}, {disk: 'sde1', idx: 4}],
		action: 'resync',
		progress: '72.2%',
	},
	{
		device: 'md1',
		status: 'active',
		type: 'raid1',
		partitions: [{disk: 'sda2', idx: 0}, {disk: 'sdb2', idx: 1}, {disk: 'sdc2', idx: 2}, {disk: 'sdd2', idx: 3}, {disk: 'sde2', idx: 4}],
		action: 'recovery',
		progress: '0.4%',
	},
	{
		device: 'md2',
		status: 'active',
		type: 'raid5',
		partitions: [{disk: 'sda5', idx: 0}, {disk: 'sdb5', idx: 1}, {disk: 'sdc5', idx: 2}, {disk: 'sdd5', idx: 3}, {disk: 'sde5', idx: 4}],
		action: 'check',
		progress: '0.2%',
	},
	{
		device: 'md9',
		status: 'active',
		type: 'raid5',
		partitions: [
			{disk: 'sdc1', idx: 0},
			{disk: 'sdd1', idx: 1},
			{disk: 'sde1', idx: 2},
			{disk: 'sdf1', idx: 3},
			{disk: 'sdg1', idx: 4},
			{disk: 'sdh1', idx: 5, isSpare: true},
		],
	},
];
```

```javascript
const {LinuxMdInfo} = require('synologyjs');
const raid = new LinuxMdInfo({host: 'synology', username: 'root', privateKey: './synology'});

raid
	.checkMd('md0')
	.then(function(data) {
		console.log(data);
	})
	.catch(function(err) {
		console.log(err);
	});
```

## Simple expressjs test setup

```javascript
const express = require('express');
const app = express();
const {LinuxMdInfo} = require('synologyjs');
const raid = new LinuxMdInfo({host: 'synology',username: 'root',privateKey: './synology'});

app.get('/list', function (req, res) {
  raid.getMdStatus()
    .then(function(data){
      res.json(data);
    });
    .catch((err) => {
      res.status(500).send(err.message);
    })
});

app.post('/check/:deviceId', function (req, res) {
  if ( req.params.deviceId ) {
    raid.checkMd(req.params.deviceId)
      .then(function(data){
        res.end();
      })
      .catch(function(err){
        res.status(500).send(err.message);
      });
  } else {
    res.end();
  }
});

app.listen(8080, function () {
  console.log('app listening on port 8080!');
});
```
